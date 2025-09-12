from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator
from datetime import datetime
import logging

from .models import CreditApplication, CreditScore
from .serializers import (
    CreditApplicationSerializer, CreditApplicationListSerializer,
    CreditScoreSerializer, ScoreCalculationRequestSerializer,
    PsychometricQuestionSerializer
)
from .services.scoring_engine import CreditScoringEngine
from .services.psychometric_analyzer import PsychometricAnalyzer
from apps.common.mixins import ResponseMixin, AuditMixin, ValidationMixin
from apps.common.permissions import IsAnalystOrAbove, CanCreateApplications, CanViewReports
from apps.common.utils import generate_application_id, paginate_queryset
from apps.authentication.models import User

logger = logging.getLogger(__name__)

class ApplicationListCreateView(APIView, ResponseMixin, AuditMixin, ValidationMixin):
    """List and create credit applications"""
    permission_classes = [IsAuthenticated, CanCreateApplications]
    
    def get(self, request):
        """Get paginated list of applications"""
        try:
            # Get query parameters
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 20))
            status_filter = request.GET.get('status')
            search = request.GET.get('search')
            business_type = request.GET.get('business_type')
            date_from = request.GET.get('date_from')
            date_to = request.GET.get('date_to')
            
            # Build query
            query_params = {}
            if status_filter:
                query_params['status'] = status_filter
            if business_type:
                query_params['business_data__business_type__icontains'] = business_type
            if date_from:
                query_params['created_at__gte'] = datetime.fromisoformat(date_from)
            if date_to:
                query_params['created_at__lte'] = datetime.fromisoformat(date_to)
            
            # Get applications
            applications = CreditApplication.objects(**query_params).order_by('-created_at')
            
            # Apply search filter
            if search:
                applications = applications.filter(
                    borrower_info__full_name__icontains=search
                ) | applications.filter(
                    business_data__business_name__icontains=search
                ) | applications.filter(
                    application_id__icontains=search
                )
            
            # Paginate results
            paginated_data = paginate_queryset(applications, page, page_size)
            
            # Serialize data
            serializer = CreditApplicationListSerializer(paginated_data['items'], many=True)
            
            return self.success_response({
                'results': serializer.data,
                'pagination': paginated_data['pagination']
            })
            
        except Exception as e:
            logger.error(f"Error fetching applications: {str(e)}")
            return self.error_response(
                message="Failed to fetch applications",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request):
        """Create new credit application"""
        try:
            # Get current user
            user_id = request.user.get('user_id')
            user = User.objects(id=user_id).first()
            
            if not user:
                return self.error_response(
                    message="User not found",
                    status_code=status.HTTP_401_UNAUTHORIZED
                )
            
            # Validate input data
            serializer = CreditApplicationSerializer(data=request.data)
            if not serializer.is_valid():
                return self.validation_error_response(serializer)
            
            # Create application
            application_data = serializer.validated_data
            application_data['application_id'] = generate_application_id()
            application_data['status'] = 'pending'
            application_data['submitted_by'] = str(user.id)
            
            # Convert nested dictionaries to embedded documents
            from .models import BorrowerInfo, BusinessData, FinancialData, LoanInfo
            
            # Convert borrower info
            borrower_data = application_data.pop('borrower_info')
            borrower_info = BorrowerInfo(**borrower_data)
            
            # Convert business data
            business_data = application_data.pop('business_data')
            business_data_obj = BusinessData(**business_data)
            
            # Convert financial data
            financial_data = application_data.pop('financial_data')
            existing_loans = financial_data.pop('existing_loans', [])
            loan_objects = [LoanInfo(**loan) for loan in existing_loans]
            financial_data['existing_loans'] = loan_objects
            financial_data_obj = FinancialData(**financial_data)
            
            # Create application object
            application = CreditApplication(
                **application_data,
                borrower_info=borrower_info,
                business_data=business_data_obj,
                financial_data=financial_data_obj
            )
            application.save()
            
            # Log activity
            self.log_user_activity(
                user=user,
                action='create_application',
                resource=application.application_id,
                details={
                    'borrower_name': borrower_info.full_name,
                    'business_name': business_data_obj.business_name
                },
                request=request
            )
            
            # Return created application
            response_serializer = CreditApplicationSerializer(application)
            return self.success_response(
                data=response_serializer.data,
                message="Application created successfully",
                status_code=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            logger.error(f"Error creating application: {str(e)}")
            return self.error_response(
                message="Failed to create application",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ApplicationDetailView(APIView, ResponseMixin, AuditMixin):
    """Get, update, delete specific application"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, application_id):
        """Get application details"""
        try:
            application = CreditApplication.objects(application_id=application_id).first()
            
            if not application:
                return self.error_response(
                    message="Application not found",
                    status_code=status.HTTP_404_NOT_FOUND
                )
            
            serializer = CreditApplicationSerializer(application)
            return self.success_response(data=serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching application: {str(e)}")
            return self.error_response(
                message="Failed to fetch application",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request, application_id):
        """Update application"""
        try:
            application = CreditApplication.objects(application_id=application_id).first()
            
            if not application:
                return self.error_response(
                    message="Application not found",
                    status_code=status.HTTP_404_NOT_FOUND
                )
            
            # Check if application can be updated
            if application.status in ['completed', 'rejected']:
                return self.error_response(
                    message="Cannot update completed or rejected application",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate and update
            serializer = CreditApplicationSerializer(data=request.data, partial=True)
            if not serializer.is_valid():
                return self.validation_error_response(serializer)
            
            # Update application fields
            update_data = serializer.validated_data
            for key, value in update_data.items():
                setattr(application, key, value)
            
            application.updated_at = datetime.utcnow()
            application.save()
            
            # Log activity
            user_id = request.user.get('user_id')
            user = User.objects(id=user_id).first()
            if user:
                self.log_user_activity(
                    user=user,
                    action='update_application',
                    resource=application.application_id,
                    request=request
                )
            
            response_serializer = CreditApplicationSerializer(application)
            return self.success_response(
                data=response_serializer.data,
                message="Application updated successfully"
            )
            
        except Exception as e:
            logger.error(f"Error updating application: {str(e)}")
            return self.error_response(
                message="Failed to update application",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ScoreCalculationView(APIView, ResponseMixin, AuditMixin):
    """Calculate credit score for application"""
    permission_classes = [IsAuthenticated, IsAnalystOrAbove]
    
    def post(self, request):
        """Calculate credit score"""
        try:
            # Validate request data
            serializer = ScoreCalculationRequestSerializer(data=request.data)
            if not serializer.is_valid():
                return self.validation_error_response(serializer)
            
            application_id = serializer.validated_data['application_id']
            psychometric_responses = serializer.validated_data.get('psychometric_responses')
            force_recalculate = serializer.validated_data.get('force_recalculate', False)
            
            # Get application
            application = CreditApplication.objects(application_id=application_id).first()
            if not application:
                return self.error_response(
                    message="Application not found",
                    status_code=status.HTTP_404_NOT_FOUND
                )
            
            # Check if score already exists and not forcing recalculation
            existing_score = CreditScore.objects(application=application).first()
            if existing_score and not force_recalculate:
                serializer = CreditScoreSerializer(existing_score)
                return self.success_response(
                    data=serializer.data,
                    message="Score already calculated (use force_recalculate=true to recalculate)"
                )
            
            # Calculate score using scoring engine
            scoring_engine = CreditScoringEngine()
            credit_score = scoring_engine.calculate_credit_score(
                application=application,
                psychometric_responses=psychometric_responses
            )
            
            # Update application status
            application.status = 'completed'
            application.save()
            
            # Log activity
            user_id = request.user.get('user_id')
            user = User.objects(id=user_id).first()
            if user:
                self.log_user_activity(
                    user=user,
                    action='calculate_score',
                    resource=application.application_id,
                    details={
                        'final_score': float(credit_score.total_points),
                        'grade': credit_score.grade,
                        'risk_level': credit_score.risk_level
                    },
                    request=request
                )
            
            # Return calculated score
            response_serializer = CreditScoreSerializer(credit_score)
            return self.success_response(
                data=response_serializer.data,
                message="Score calculated successfully"
            )
            
        except Exception as e:
            logger.error(f"Error calculating score: {str(e)}")
            return self.error_response(
                message=f"Failed to calculate score: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ScoreResultsView(APIView, ResponseMixin):
    """Get credit score results"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, application_id):
        """Get score results for application"""
        try:
            # Get application
            application = CreditApplication.objects(application_id=application_id).first()
            if not application:
                return self.error_response(
                    message="Application not found",
                    status_code=status.HTTP_404_NOT_FOUND
                )
            
            # Get score
            credit_score = CreditScore.objects(application=application).first()
            if not credit_score:
                return self.error_response(
                    message="Score not calculated yet",
                    status_code=status.HTTP_404_NOT_FOUND
                )
            
            serializer = CreditScoreSerializer(credit_score)
            return self.success_response(data=serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching score results: {str(e)}")
            return self.error_response(
                message="Failed to fetch score results",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PsychometricQuestionsView(APIView, ResponseMixin):
    """Get psychometric test questions"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all psychometric questions"""
        try:
            analyzer = PsychometricAnalyzer()
            questions = analyzer.get_all_questions_for_test()
            
            return self.success_response(data=questions)
            
        except Exception as e:
            logger.error(f"Error fetching psychometric questions: {str(e)}")
            return self.error_response(
                message="Failed to fetch questions",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class BulkScoreCalculationView(APIView, ResponseMixin, AuditMixin):
    """Bulk score calculation for multiple applications"""
    permission_classes = [IsAuthenticated, IsAnalystOrAbove]
    
    def post(self, request):
        """Calculate scores for multiple applications"""
        try:
            application_ids = request.data.get('application_ids', [])
            
            if not application_ids:
                return self.error_response(
                    message="No application IDs provided",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            scoring_engine = CreditScoringEngine()
            results = {
                'processed': 0,
                'successful': 0,
                'failed': 0,
                'errors': []
            }
            
            for app_id in application_ids:
                try:
                    application = CreditApplication.objects(application_id=app_id).first()
                    if application:
                        scoring_engine.calculate_credit_score(application)
                        results['successful'] += 1
                    else:
                        results['errors'].append(f"Application {app_id} not found")
                        results['failed'] += 1
                    results['processed'] += 1
                    
                except Exception as e:
                    results['errors'].append(f"Error processing {app_id}: {str(e)}")
                    results['failed'] += 1
                    results['processed'] += 1
            
            # Log activity
            user_id = request.user.get('user_id')
            user = User.objects(id=user_id).first()
            if user:
                self.log_user_activity(
                    user=user,
                    action='bulk_calculate_scores',
                    details={
                        'total_applications': len(application_ids),
                        'successful': results['successful'],
                        'failed': results['failed']
                    },
                    request=request
                )
            
            return self.success_response(
                data=results,
                message=f"Bulk calculation completed: {results['successful']} successful, {results['failed']} failed"
            )
            
        except Exception as e:
            logger.error(f"Error in bulk score calculation: {str(e)}")
            return self.error_response(
                message="Bulk calculation failed",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DashboardStatsView(APIView, ResponseMixin):
    """Get dashboard statistics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get dashboard statistics"""
        try:
            date_range = request.GET.get('date_range', '6m')
            
            # Calculate date filter based on range
            if date_range == '1m':
                date_filter = datetime.utcnow() - timedelta(days=30)
            elif date_range == '3m':
                date_filter = datetime.utcnow() - timedelta(days=90)
            elif date_range == '6m':
                date_filter = datetime.utcnow() - timedelta(days=180)
            else:  # 1y
                date_filter = datetime.utcnow() - timedelta(days=365)
            
            # Get application statistics
            total_applications = CreditApplication.objects(created_at__gte=date_filter).count()
            pending_applications = CreditApplication.objects(
                created_at__gte=date_filter,
                status='pending'
            ).count()
            completed_applications = CreditApplication.objects(
                created_at__gte=date_filter,
                status='completed'
            ).count()
            rejected_applications = CreditApplication.objects(
                created_at__gte=date_filter,
                status='rejected'
            ).count()
            
            # Get score statistics
            scores = CreditScore.objects(calculated_at__gte=date_filter)
            if scores:
                average_score = sum([float(score.total_points) for score in scores]) / len(scores)
                
                # Grade distribution
                grade_distribution = {}
                for score in scores:
                    grade = score.grade
                    grade_distribution[grade] = grade_distribution.get(grade, 0) + 1
                
                # Risk distribution
                risk_distribution = {}
                for score in scores:
                    risk = score.risk_level
                    risk_distribution[risk] = risk_distribution.get(risk, 0) + 1
            else:
                average_score = 0
                grade_distribution = {}
                risk_distribution = {}
            
            # Monthly trends (simplified)
            monthly_trends = []
            for i in range(6):
                month_start = datetime.utcnow().replace(day=1) - timedelta(days=30*i)
                month_end = month_start + timedelta(days=30)
                
                month_applications = CreditApplication.objects(
                    created_at__gte=month_start,
                    created_at__lt=month_end
                ).count()
                
                month_scores = CreditScore.objects(
                    calculated_at__gte=month_start,
                    calculated_at__lt=month_end
                )
                
                if month_scores:
                    month_avg_score = sum([float(s.total_points) for s in month_scores]) / len(month_scores)
                    approval_rate = len([s for s in month_scores if s.grade in ['A', 'B', 'C']]) / len(month_scores) * 100
                else:
                    month_avg_score = 0
                    approval_rate = 0
                
                monthly_trends.append({
                    'month': month_start.strftime('%b'),
                    'applications': month_applications,
                    'avg_score': round(month_avg_score, 1),
                    'approval_rate': round(approval_rate, 1)
                })
            
            monthly_trends.reverse()  # Show oldest to newest
            
            return self.success_response(data={
                'total_applications': total_applications,
                'pending_applications': pending_applications,
                'completed_applications': completed_applications,
                'rejected_applications': rejected_applications,
                'average_score': round(average_score, 1),
                'grade_distribution': grade_distribution,
                'risk_distribution': risk_distribution,
                'monthly_trends': monthly_trends
            })
            
        except Exception as e:
            logger.error(f"Error fetching dashboard stats: {str(e)}")
            return self.error_response(
                message="Failed to fetch dashboard statistics",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
