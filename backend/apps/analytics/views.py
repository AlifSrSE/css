from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from datetime import datetime
import logging

from .analytics_service import AnalyticsService
from apps.common.mixins import ResponseMixin
from apps.common.permissions import CanViewReports

logger = logging.getLogger(__name__)

class DashboardAnalyticsView(APIView, ResponseMixin):
    """Get dashboard analytics"""
    permission_classes = [IsAuthenticated, CanViewReports]
    
    def get(self, request):
        """Get dashboard analytics data"""
        try:
            # Parse query parameters
            date_from = request.GET.get('date_from')
            date_to = request.GET.get('date_to')
            business_type = request.GET.get('business_type')
            grade = request.GET.get('grade')
            
            # Convert date strings to datetime objects
            if date_from:
                date_from = datetime.fromisoformat(date_from)
            if date_to:
                date_to = datetime.fromisoformat(date_to)
            
            # Get analytics data
            analytics_service = AnalyticsService()
            analytics_data = analytics_service.get_dashboard_analytics(
                date_from=date_from,
                date_to=date_to,
                business_type=business_type,
                grade=grade
            )
            
            return self.success_response(data=analytics_data)
            
        except Exception as e:
            logger.error(f"Error fetching dashboard analytics: {str(e)}")
            return self.error_response(
                message="Failed to fetch analytics data",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PerformanceMetricsView(APIView, ResponseMixin):
    """Get model performance metrics"""
    permission_classes = [IsAuthenticated, CanViewReports]
    
    def get(self, request):
        """Get performance metrics"""
        try:
            period = request.GET.get('period', '6m')
            
            analytics_service = AnalyticsService()
            performance_data = analytics_service.get_performance_metrics(period=period)
            
            return self.success_response(data=performance_data)
            
        except Exception as e:
            logger.error(f"Error fetching performance metrics: {str(e)}")
            return self.error_response(
                message="Failed to fetch performance metrics",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class BusinessInsightsView(APIView, ResponseMixin):
    """Get business insights"""
    permission_classes = [IsAuthenticated, CanViewReports]
    
    def get(self, request):
        """Get business insights and recommendations"""
        try:
            analytics_service = AnalyticsService()
            insights_data = analytics_service.get_business_insights()
            
            return self.success_response(data=insights_data)
            
        except Exception as e:
            logger.error(f"Error fetching business insights: {str(e)}")
            return self.error_response(
                message="Failed to fetch business insights",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse, Http404
from datetime import datetime, timedelta
import os
import logging

from .models import GeneratedReport, ReportTemplate
from .serializers import ReportGenerationRequestSerializer, ReportListSerializer
from .report_generator import ReportGenerator
from apps.common.mixins import ResponseMixin, AuditMixin
from apps.common.permissions import CanViewReports, IsAnalystOrAbove
from apps.common.utils import paginate_queryset
from apps.authentication.models import User

logger = logging.getLogger(__name__)

class ReportGenerationView(APIView, ResponseMixin, AuditMixin):
    """Generate reports"""
    permission_classes = [IsAuthenticated, CanViewReports]
    
    def post(self, request):
        """Generate new report"""
        try:
            # Validate request
            serializer = ReportGenerationRequestSerializer(data=request.data)
            if not serializer.is_valid():
                return self.validation_error_response(serializer)
            
            # Get current user
            user_id = request.user.get('user_id')
            user = User.objects(id=user_id).first()
            
            if not user:
                return self.error_response(
                    message="User not found",
                    status_code=status.HTTP_401_UNAUTHORIZED
                )
            
            # Extract request data
            report_type = serializer.validated_data['report_type']
            application_ids = serializer.validated_data['application_ids']
            format_type = serializer.validated_data.get('format', 'pdf')
            include_charts = serializer.validated_data.get('include_charts', True)
            include_recommendations = serializer.validated_data.get('include_recommendations', True)
            
            # Generate report
            generator = ReportGenerator()
            result = generator.generate_report(
                report_type=report_type,
                application_ids=application_ids,
                format=format_type,
                include_charts=include_charts,
                include_recommendations=include_recommendations
            )
            
            # Save report record
            report_record = GeneratedReport(
                report_id=result['report_id'],
                report_type=result['report_type'],
                application_ids=application_ids,
                format=result['format'],
                report_data=result['report_data'],
                file_path=result['file_path'],
                download_url=result['download_url'],
                requested_by=str(user.id),
                generated_at=result['generated_at'],
                generation_duration=result['generation_duration'],
                file_size=result['file_size'],
                status='completed',
                expires_at=result['expires_at']
            )
            report_record.save()
            
            # Log activity
            self.log_user_activity(
                user=user,
                action='generate_report',
                resource=result['report_id'],
                details={
                    'report_type': report_type,
                    'format': format_type,
                    'application_count': len(application_ids)
                },
                request=request
            )
            
            return self.success_response(
                 data={
                    'report_id': result['report_id'],
                    'report_type': result['report_type'],
                    'format': result['format'],
                    'status': result['status'],
                    'download_url': result['download_url'],
                    'file_size': result['file_size'],
                    'expires_at': result['expires_at'].isoformat()
                },
                message="Report generated successfully",
                status_code=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            logger.error(f"Report generation failed: {str(e)}")
            return self.error_response(
                message=f"Report generation failed: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ReportListView(APIView, ResponseMixin):
    """List generated reports"""
    permission_classes = [IsAuthenticated, CanViewReports]
    
    def get(self, request):
        """Get user's reports"""
        try:
            # Get current user
            user_id = request.user.get('user_id')
            user = User.objects(id=user_id).first()
            
            if not user:
                return self.error_response(
                    message="User not found",
                    status_code=status.HTTP_401_UNAUTHORIZED
                )
            
            # Get query parameters
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 20))
            report_type = request.GET.get('report_type')
            status_filter = request.GET.get('status')
            
            # Build query
            query_params = {'requested_by': str(user.id)}
            if report_type:
                query_params['report_type'] = report_type
            if status_filter:
                query_params['status'] = status_filter
            
            # Get reports
            reports = GeneratedReport.objects(**query_params).order_by('-generated_at')
            
            # Paginate
            paginated_data = paginate_queryset(reports, page, page_size)
            
            # Serialize
            serializer_data = []
            for report in paginated_data['items']:
                serializer_data.append({
                    'id': str(report.id),
                    'report_id': report.report_id,
                    'report_type': report.report_type,
                    'format': report.format,
                    'status': report.status,
                    'generated_at': report.generated_at,
                    'expires_at': report.expires_at,
                    'file_size': report.file_size,
                    'download_url': report.download_url
                })
            
            return self.success_response({
                'results': serializer_data,
                'pagination': paginated_data['pagination']
            })
            
        except Exception as e:
            logger.error(f"Error fetching reports: {str(e)}")
            return self.error_response(
                message="Failed to fetch reports",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ReportDownloadView(APIView):
    """Download generated reports"""
    permission_classes = [IsAuthenticated, CanViewReports]
    
    def get(self, request, report_id):
        """Download report file"""
        try:
            # Get report
            report = GeneratedReport.objects(report_id=report_id).first()
            
            if not report:
                return Response(
                    {'error': 'Report not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if user can access this report
            user_id = request.user.get('user_id')
            if report.requested_by != str(user_id):
                # Check if user is admin or manager
                user = User.objects(id=user_id).first()
                if not user or user.role not in ['admin', 'manager']:
                    return Response(
                        {'error': 'Access denied'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            # Check if report has expired
            if report.expires_at and datetime.utcnow() > report.expires_at:
                return Response(
                    {'error': 'Report has expired'},
                    status=status.HTTP_410_GONE
                )
            
            # Check if file exists
            if not os.path.exists(report.file_path):
                return Response(
                    {'error': 'Report file not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Log download activity
            user = User.objects(id=user_id).first()
            if user:
                self.log_user_activity(
                    user=user,
                    action='download_report',
                    resource=report_id,
                    request=request
                )
            
            # Return file
            response = FileResponse(
                open(report.file_path, 'rb'),
                content_type='application/octet-stream'
            )
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(report.file_path)}"'
            return response
            
        except Exception as e:
            logger.error(f"Error downloading report: {str(e)}")
            return Response(
                {'error': 'Download failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ScoreBreakdownView(APIView, ResponseMixin):
    """Get score breakdown for specific application"""
    permission_classes = [IsAuthenticated, CanViewReports]
    
    def get(self, request, application_id):
        """Get detailed score breakdown"""
        try:
            from apps.credit_scoring.models import CreditApplication, CreditScore
            
            # Get application and score
            application = CreditApplication.objects(application_id=application_id).first()
            if not application:
                return self.error_response(
                    message="Application not found",
                    status_code=status.HTTP_404_NOT_FOUND
                )
            
            score = CreditScore.objects(application=application).first()
            if not score:
                return self.error_response(
                    message="Score not calculated yet",
                    status_code=status.HTTP_404_NOT_FOUND
                )
            
            # Generate breakdown report
            generator = ReportGenerator()
            report_data = generator._generate_score_breakdown([{
                'application': application,
                'score': score
            }])
            
            # Return the breakdown for single application
            if report_data['applications']:
                breakdown = report_data['applications'][0]
                
                return self.success_response(data={
                    'application_id': breakdown['application_id'],
                    'borrower_name': breakdown['borrower_name'],
                    'business_name': breakdown['business_name'],
                    'final_score': breakdown['score_details']['final_score'],
                    'grade': breakdown['score_details']['grade'],
                    'component_scores': breakdown['score_details']['component_scores'],
                    'risk_assessment': breakdown['risk_assessment'],
                    'recommendations': breakdown['recommendations']
                })
            else:
                return self.error_response(
                    message="Unable to generate breakdown",
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except Exception as e:
            logger.error(f"Error generating score breakdown: {str(e)}")
            return self.error_response(
                message="Failed to generate score breakdown",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RiskAssessmentView(APIView, ResponseMixin):
    """Get risk assessment for specific application"""
    permission_classes = [IsAuthenticated, CanViewReports]
    
    def get(self, request, application_id):
        """Get detailed risk assessment"""
        try:
            from apps.credit_scoring.models import CreditApplication, CreditScore
            
            # Get application and score
            application = CreditApplication.objects(application_id=application_id).first()
            if not application:
                return self.error_response(
                    message="Application not found",
                    status_code=status.HTTP_404_NOT_FOUND
                )
            
            score = CreditScore.objects(application=application).first()
            if not score:
                return self.error_response(
                    message="Score not calculated yet",
                    status_code=status.HTTP_404_NOT_FOUND
                )
            
            # Generate risk assessment
            generator = ReportGenerator()
            risk_factors = generator._identify_risk_factors(application, score)
            mitigation_strategies = generator._generate_mitigation_strategies(score)
            monitoring_recommendations = generator._generate_monitoring_recommendations(score)
            
            return self.success_response(data={
                'application_id': application_id,
                'risk_level': score.risk_level,
                'default_probability': float(score.default_probability),
                'red_flags': [
                    {
                        'type': flag.flag_type,
                        'name': flag.flag_name,
                        'description': flag.description,
                        'severity': flag.severity,
                        'impact': flag.impact
                    }
                    for flag in score.red_flags
                ],
                'risk_factors': risk_factors,
                'mitigation_strategies': mitigation_strategies,
                'monitoring_recommendations': monitoring_recommendations
            })
            
        except Exception as e:
            logger.error(f"Error generating risk assessment: {str(e)}")
            return self.error_response(
                message="Failed to generate risk assessment",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )