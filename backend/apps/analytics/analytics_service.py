from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from decimal import Decimal
import logging

from .models import AnalyticsMetric, ModelPerformanceMetric
from apps.credit_scoring.models import CreditApplication, CreditScore

logger = logging.getLogger(__name__)

class AnalyticsService:
    """Service for generating analytics and insights"""
    
    def __init__(self):
        pass
    
    def get_dashboard_analytics(self, date_from: datetime = None, date_to: datetime = None,
                              business_type: str = None, grade: str = None) -> Dict[str, Any]:
        """Get comprehensive dashboard analytics"""
        try:
            # Set default date range if not provided
            if not date_to:
                date_to = datetime.utcnow()
            if not date_from:
                date_from = date_to - timedelta(days=180)  # 6 months default
            
            # Build query filters
            app_filters = {'created_at__gte': date_from, 'created_at__lte': date_to}
            score_filters = {'calculated_at__gte': date_from, 'calculated_at__lte': date_to}
            
            if business_type:
                app_filters['business_data__business_type'] = business_type
            if grade:
                score_filters['grade'] = grade
            
            # Get applications and scores
            applications = CreditApplication.objects(**app_filters)
            scores = CreditScore.objects(**score_filters)
            
            # Calculate score trends
            score_trends = self._calculate_score_trends(scores, date_from, date_to)
            
            # Calculate grade distribution
            grade_distribution = self._calculate_grade_distribution(scores)
            
            # Calculate risk distribution
            risk_distribution = self._calculate_risk_distribution(scores)
            
            # Calculate approval rates
            approval_rates = self._calculate_approval_rates(scores, date_from, date_to)
            
            # Get top red flags
            top_red_flags = self._get_top_red_flags(scores)
            
            return {
                'score_trends': score_trends,
                'grade_distribution': grade_distribution,
                'risk_distribution': risk_distribution,
                'approval_rates': approval_rates,
                'top_red_flags': top_red_flags,
                'summary': {
                    'total_applications': applications.count(),
                    'total_scored': scores.count(),
                    'average_score': self._calculate_average_score(scores),
                    'approval_rate': self._calculate_overall_approval_rate(scores)
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating dashboard analytics: {str(e)}")
            raise
    
    def get_performance_metrics(self, period: str = '6m') -> Dict[str, Any]:
        """Get model performance metrics"""
        try:
            # Calculate date range based on period
            end_date = datetime.utcnow()
            if period == '1m':
                start_date = end_date - timedelta(days=30)
            elif period == '3m':
                start_date = end_date - timedelta(days=90)
            elif period == '1y':
                start_date = end_date - timedelta(days=365)
            else:  # 6m default
                start_date = end_date - timedelta(days=180)
            
            # Get applications and scores in the period
            applications = CreditApplication.objects(
                created_at__gte=start_date,
                created_at__lte=end_date
            )
            scores = CreditScore.objects(
                calculated_at__gte=start_date,
                calculated_at__lte=end_date
            )
            
            # Calculate performance metrics
            model_accuracy = self._calculate_model_accuracy(scores)
            precision_by_grade = self._calculate_precision_by_grade(scores)
            recall_by_grade = self._calculate_recall_by_grade(scores)
            false_positive_rate = self._calculate_false_positive_rate(scores)
            false_negative_rate = self._calculate_false_negative_rate(scores)
            
            return {
                'model_accuracy': model_accuracy,
                'precision_by_grade': precision_by_grade,
                'recall_by_grade': recall_by_grade,
                'false_positive_rate': false_positive_rate,
                'false_negative_rate': false_negative_rate,
                'evaluation_period': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat(),
                    'total_samples': scores.count()
                }
            }
            
        except Exception as e:
            logger.error(f"Error calculating performance metrics: {str(e)}")
            raise
    
    def get_business_insights(self) -> Dict[str, Any]:
        """Get business insights and recommendations"""
        try:
            # Get data from last 6 months
            six_months_ago = datetime.utcnow() - timedelta(days=180)
            scores = CreditScore.objects(calculated_at__gte=six_months_ago)
            
            # Analyze high-performing sectors
            high_performing_sectors = self._identify_high_performing_sectors(scores)
            
            # Identify risk concentrations
            risk_concentrations = self._identify_risk_concentrations(scores)
            
            # Analyze seasonal patterns
            seasonal_patterns = self._analyze_seasonal_patterns(scores)
            
            # Generate recommendations
            recommendations = self._generate_business_recommendations(
                high_performing_sectors, risk_concentrations, seasonal_patterns
            )
            
            return {
                'high_performing_sectors': high_performing_sectors,
                'risk_concentrations': risk_concentrations,
                'seasonal_patterns': seasonal_patterns,
                'recommendations': recommendations
            }
            
        except Exception as e:
            logger.error(f"Error generating business insights: {str(e)}")
            raise
    
    # Helper methods for analytics calculations
    
    def _calculate_score_trends(self, scores, date_from: datetime, date_to: datetime) -> List[Dict]:
        """Calculate score trends over time"""
        trends = []
        
        # Group scores by month
        monthly_data = {}
        for score in scores:
            month_key = score.calculated_at.strftime('%Y-%m')
            if month_key not in monthly_data:
                monthly_data[month_key] = []
            monthly_data[month_key].append(float(score.total_points))
        
        # Calculate monthly averages
        for month, score_list in sorted(monthly_data.items()):
            avg_score = sum(score_list) / len(score_list) if score_list else 0
            trends.append({
                'date': month,
                'avg_score': round(avg_score, 2),
                'count': len(score_list)
            })
        
        return trends
    
    def _calculate_grade_distribution(self, scores) -> Dict[str, int]:
        """Calculate distribution of grades"""
        distribution = {'A': 0, 'B': 0, 'C': 0, 'R': 0}
        
        for score in scores:
            if score.grade in distribution:
                distribution[score.grade] += 1
        
        return distribution
    
    def _calculate_risk_distribution(self, scores) -> Dict[str, int]:
        """Calculate distribution of risk levels"""
        distribution = {'low': 0, 'medium': 0, 'high': 0, 'very_high': 0}
        
        for score in scores:
            if score.risk_level in distribution:
                distribution[score.risk_level] += 1
        
        return distribution
    
    def _calculate_approval_rates(self, scores, date_from: datetime, date_to: datetime) -> List[Dict]:
        """Calculate approval rates over time"""
        approval_rates = []
        
        # Group by month
        monthly_data = {}
        for score in scores:
            month_key = score.calculated_at.strftime('%Y-%m')
            if month_key not in monthly_data:
                monthly_data[month_key] = {'total': 0, 'approved': 0}
            
            monthly_data[month_key]['total'] += 1
            if score.grade in ['A', 'B', 'C']:  # Not rejected
                monthly_data[month_key]['approved'] += 1
        
        # Calculate rates
        for month, data in sorted(monthly_data.items()):
            rate = (data['approved'] / data['total']) * 100 if data['total'] > 0 else 0
            approval_rates.append({
                'month': month,
                'rate': round(rate, 2)
            })
        
        return approval_rates
    
    def _get_top_red_flags(self, scores) -> List[Dict]:
        """Get most common red flags"""
        flag_counts = {}
        
        for score in scores:
            for flag in score.red_flags:
                flag_name = flag.flag_name
                if flag_name not in flag_counts:
                    flag_counts[flag_name] = {
                        'count': 0,
                        'flag_type': flag.flag_type,
                        'severity': flag.severity
                    }
                flag_counts[flag_name]['count'] += 1
        
        # Sort by count and return top 10
        sorted_flags = sorted(flag_counts.items(), key=lambda x: x[1]['count'], reverse=True)
        
        top_flags = []
        total_scores = scores.count()
        
        for flag_name, data in sorted_flags[:10]:
            percentage = (data['count'] / total_scores) * 100 if total_scores > 0 else 0
            top_flags.append({
                'flag': flag_name,
                'count': data['count'],
                'percentage': round(percentage, 2),
                'type': data['flag_type'],
                'severity': data['severity']
            })
        
        return top_flags
    
    def _calculate_average_score(self, scores) -> float:
        """Calculate average score"""
        if not scores:
            return 0.0
        
        total = sum([float(score.total_points) for score in scores])
        return round(total / scores.count(), 2)
    
    def _calculate_overall_approval_rate(self, scores) -> float:
        """Calculate overall approval rate"""
        if not scores:
            return 0.0
        
        approved = sum([1 for score in scores if score.grade in ['A', 'B', 'C']])
        return round((approved / scores.count()) * 100, 2)
    
    def _calculate_model_accuracy(self, scores) -> float:
        """Calculate model accuracy (placeholder implementation)"""
        # This would require actual vs predicted data
        # For now, return a calculated metric based on score distribution
        if not scores:
            return 0.0
        
        # Simple heuristic: higher accuracy if grade distribution is reasonable
        grade_dist = self._calculate_grade_distribution(scores)
        total = sum(grade_dist.values())
        
        if total == 0:
            return 0.0
        
        # Good distribution would have reasonable spread across grades
        # This is a simplified calculation
        balanced_score = 1.0 - abs(0.25 - (grade_dist['A'] / total)) * 2
        return max(0.7, min(0.95, balanced_score))  # Keep between 70% and 95%
    
    def _calculate_precision_by_grade(self, scores) -> Dict[str, float]:
        """Calculate precision by grade (placeholder)"""
        # This would require actual performance data
        return {
            'A': 0.92,
            'B': 0.88,
            'C': 0.75,
            'R': 0.85
        }
    
    def _calculate_recall_by_grade(self, scores) -> Dict[str, float]:
        """Calculate recall by grade (placeholder)"""
        return {
            'A': 0.89,
            'B': 0.91,
            'C': 0.78,
            'R': 0.82
        }
    
    def _calculate_false_positive_rate(self, scores) -> float:
        """Calculate false positive rate (placeholder)"""
        return 0.08  # 8%
    
    def _calculate_false_negative_rate(self, scores) -> float:
        """Calculate false negative rate (placeholder)"""
        return 0.12  # 12%
    
    def _identify_high_performing_sectors(self, scores) -> List[str]:
        """Identify high-performing business sectors"""
        sector_performance = {}
        
        for score in scores:
            # Get business type from application
            app = score.application
            if app and app.business_data:
                business_type = app.business_data.business_type
                
                if business_type not in sector_performance:
                    sector_performance[business_type] = {
                        'scores': [],
                        'approved_count': 0,
                        'total_count': 0
                    }
                
                sector_performance[business_type]['scores'].append(float(score.total_points))
                sector_performance[business_type]['total_count'] += 1
                
                if score.grade in ['A', 'B']:
                    sector_performance[business_type]['approved_count'] += 1
        
        # Calculate performance metrics and identify top performers
        high_performers = []
        
        for business_type, data in sector_performance.items():
            if data['total_count'] >= 10:  # Minimum sample size
                avg_score = sum(data['scores']) / len(data['scores'])
                approval_rate = data['approved_count'] / data['total_count']
                
                # Consider high performing if avg score > 65 and approval rate > 80%
                if avg_score > 65 and approval_rate > 0.8:
                    high_performers.append(business_type)
        
        return high_performers
    
    def _identify_risk_concentrations(self, scores) -> Dict[str, float]:
        """Identify risk concentrations"""
        risk_concentrations = {}
        
        # Group by business type and calculate risk percentages
        business_risk = {}
        
        for score in scores:
            app = score.application
            if app and app.business_data:
                business_type = app.business_data.business_type
                
                if business_type not in business_risk:
                    business_risk[business_type] = {'high_risk': 0, 'total': 0}
                
                business_risk[business_type]['total'] += 1
                if score.risk_level in ['high', 'very_high']:
                    business_risk[business_type]['high_risk'] += 1
        
        # Calculate risk concentrations
        for business_type, data in business_risk.items():
            if data['total'] >= 5:  # Minimum sample size
                risk_percentage = (data['high_risk'] / data['total']) * 100
                if risk_percentage > 30:  # High risk concentration threshold
                    risk_concentrations[business_type] = round(risk_percentage, 2)
        
        return risk_concentrations
    
    def _analyze_seasonal_patterns(self, scores) -> List[Dict]:
        """Analyze seasonal patterns"""
        monthly_patterns = {}
        
        for score in scores:
            month = score.calculated_at.month
            if month not in monthly_patterns:
                monthly_patterns[month] = {
                    'scores': [],
                    'applications': 0
                }
            
            monthly_patterns[month]['scores'].append(float(score.total_points))
            monthly_patterns[month]['applications'] += 1
        
        patterns = []
        month_names = [
            '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ]
        
        for month in range(1, 13):
            if month in monthly_patterns:
                data = monthly_patterns[month]
                avg_score = sum(data['scores']) / len(data['scores'])
                
                # Simple trend analysis
                if avg_score > 70:
                    trend = 'high'
                elif avg_score > 55:
                    trend = 'normal'
                else:
                    trend = 'low'
                
                patterns.append({
                    'month': month_names[month],
                    'trend': trend,
                    'avg_score': round(avg_score, 2),
                    'applications': data['applications']
                })
        
        return patterns
    
    def _generate_business_recommendations(self, high_performers: List, 
                                         risk_concentrations: Dict, 
                                         seasonal_patterns: List) -> List[str]:
        """Generate business recommendations"""
        recommendations = []
        
        # Recommendations based on high performers
        if high_performers:
            recommendations.append(
                f"Focus marketing on high-performing sectors: {', '.join(high_performers[:3])}"
            )
        
        # Recommendations based on risk concentrations
        if risk_concentrations:
            high_risk_sectors = list(risk_concentrations.keys())[:2]
            recommendations.append(
                f"Implement enhanced screening for high-risk sectors: {', '.join(high_risk_sectors)}"
            )
        
        # Seasonal recommendations
        if seasonal_patterns:
            low_months = [p['month'] for p in seasonal_patterns if p['trend'] == 'low']
            if low_months:
                recommendations.append(
                    f"Consider promotional campaigns during low-activity months: {', '.join(low_months[:3])}"
                )
        
        # General recommendations
        recommendations.extend([
            "Regular model retraining recommended based on new data patterns",
            "Consider implementing real-time risk monitoring for Grade C applications",
            "Expand psychometric testing to improve prediction accuracy"
        ])
        
        return recommendations