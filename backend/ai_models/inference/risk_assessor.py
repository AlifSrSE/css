import numpy as np
from typing import Dict, List, Any, Tuple
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class RiskAssessor:
    """Advanced risk assessment using ML models and business rules"""
    
    def __init__(self, predictor=None):
        self.predictor = predictor
        self.risk_thresholds = {
            'low': 0.05,
            'medium': 0.15,
            'high': 0.35,
            'very_high': 1.0
        }
    
    def comprehensive_risk_assessment(self, application_data: Dict, 
                                   score_data: Dict) -> Dict[str, Any]:
        """Perform comprehensive risk assessment"""
        try:
            risk_assessment = {
                'overall_risk_level': score_data.get('risk_level', 'medium'),
                'default_probability': score_data.get('default_probability', 0.15),
                'risk_factors': [],
                'risk_mitigation': [],
                'monitoring_requirements': [],
                'early_warning_indicators': [],
                'risk_score_breakdown': {}
            }
            
            # ML-based risk prediction if predictor is available
            if self.predictor:
                ml_prediction = self.predictor.predict_default_probability(application_data)
                risk_assessment.update({
                    'ml_default_probability': ml_prediction['default_probability'],
                    'ml_confidence': ml_prediction['confidence'],
                    'ml_risk_level': ml_prediction['risk_level']
                })
            
            # Identify specific risk factors
            risk_assessment['risk_factors'] = self._identify_risk_factors(
                application_data, score_data
            )
            
            # Risk score breakdown
            risk_assessment['risk_score_breakdown'] = self._calculate_risk_breakdown(
                application_data, score_data
            )
            
            # Generate mitigation strategies
            risk_assessment['risk_mitigation'] = self._generate_mitigation_strategies(
                risk_assessment['risk_factors'], risk_assessment['overall_risk_level']
            )
            
            # Monitoring requirements
            risk_assessment['monitoring_requirements'] = self._determine_monitoring_requirements(
                risk_assessment['overall_risk_level'], risk_assessment['risk_factors']
            )
            
            # Early warning indicators
            risk_assessment['early_warning_indicators'] = self._define_early_warning_indicators(
                application_data, risk_assessment['overall_risk_level']
            )
            
            return risk_assessment
            
        except Exception as e:
            logger.error(f"Comprehensive risk assessment failed: {str(e)}")
            raise
    
    def _identify_risk_factors(self, application_data: Dict, score_data: Dict) -> List[Dict]:
        """Identify specific risk factors"""
        risk_factors = []
        
        # Financial risk factors
        if score_data.get('credit_ratios_breakdown'):
            for ratio in score_data['credit_ratios_breakdown']:
                if ratio.get('band') == 'red':
                    risk_factors.append({
                        'category': 'financial',
                        'factor': f"Poor {ratio['ratio_name']} ratio",
                        'value': ratio['ratio_value'],
                        'severity': 'high',
                        'impact': 'Indicates potential cash flow problems'
                    })
        
        # Business risk factors
        business_data = application_data.get('business_data', {})
        
        if business_data.get('years_of_operation', 0) < 2:
            risk_factors.append({
                'category': 'business',
                'factor': 'New business operation',
                'value': business_data.get('years_of_operation', 0),
                'severity': 'medium',
                'impact': 'Limited business track record'
            })
        
        # Debt concentration risk
        financial_data = application_data.get('financial_data', {})
        existing_loans = financial_data.get('existing_loans', [])
        
        if len(existing_loans) > 3:
            risk_factors.append({
                'category': 'financial',
                'factor': 'High loan concentration',
                'value': len(existing_loans),
                'severity': 'medium',
                'impact': 'Multiple debt obligations increase default risk'
            })
        
        # Industry risk factors
        business_type = business_data.get('business_type', '').lower()
        high_risk_industries = ['wood_shop', 'gold_ornaments', 'sub_contract_factory']
        
        if any(risky in business_type for risky in high_risk_industries):
            risk_factors.append({
                'category': 'industry',
                'factor': 'High-risk industry',
                'value': business_type,
                'severity': 'high',
                'impact': 'Industry volatility increases business risk'
            })
        
        return risk_factors
    
    def _calculate_risk_breakdown(self, application_data: Dict, score_data: Dict) -> Dict[str, Any]:
        """Calculate detailed risk score breakdown"""
        breakdown = {
            'credit_risk': 0,
            'operational_risk': 0,
            'market_risk': 0,
            'liquidity_risk': 0,
            'concentration_risk': 0
        }
        
        # Credit risk (based on credit ratios)
        credit_ratios = score_data.get('credit_ratios_breakdown', [])
        red_ratios = len([r for r in credit_ratios if r.get('band') == 'red'])
        breakdown['credit_risk'] = min(100, (red_ratios / max(1, len(credit_ratios))) * 100)
        
        # Operational risk (based on business factors)
        business_data = application_data.get('business_data', {})
        years_operation = business_data.get('years_of_operation', 0)
        breakdown['operational_risk'] = max(0, 100 - (years_operation * 10))
        
        # Market risk (based on business type and industry)
        business_type = business_data.get('business_type', '').lower()
        high_risk_industries = ['wood_shop', 'gold_ornaments', 'sub_contract_factory']
        breakdown['market_risk'] = 80 if any(risky in business_type for risky in high_risk_industries) else 30
        
        # Liquidity risk (based on cash flow indicators)
        financial_data = application_data.get('financial_data', {})
        monthly_income = financial_data.get('monthly_income', 0)
        existing_installments = sum([loan.get('monthly_installment', 0) for loan in financial_data.get('existing_loans', [])])
        
        if monthly_income > 0:
            installment_ratio = existing_installments / monthly_income
            breakdown['liquidity_risk'] = min(100, installment_ratio * 100)
        else:
            breakdown['liquidity_risk'] = 100
        
        # Concentration risk (based on loan diversity)
        loan_count = len(financial_data.get('existing_loans', []))
        breakdown['concentration_risk'] = max(0, 100 - (loan_count * 15))
        
        return breakdown
    
    def _generate_mitigation_strategies(self, risk_factors: List[Dict], risk_level: str) -> List[Dict]:
        """Generate risk mitigation strategies"""
        strategies = []
        
        # General strategies based on risk level
        if risk_level in ['high', 'very_high']:
            strategies.append({
                'strategy': 'Enhanced due diligence',
                'description': 'Conduct additional verification of business operations and financial records',
                'priority': 'high',
                'timeline': '1-2 weeks'
            })
            
            strategies.append({
                'strategy': 'Collateral requirement',
                'description': 'Require additional collateral or guarantor with strong financial standing',
                'priority': 'high',
                'timeline': 'Before disbursement'
            })
        
        # Specific strategies based on risk factors
        for risk_factor in risk_factors:
            if risk_factor['category'] == 'financial':
                if 'ratio' in risk_factor['factor'].lower():
                    strategies.append({
                        'strategy': 'Cash flow monitoring',
                        'description': f"Monitor {risk_factor['factor']} through monthly financial statements",
                        'priority': 'medium',
                        'timeline': 'Monthly'
                    })
            
            elif risk_factor['category'] == 'business':
                if 'new business' in risk_factor['factor'].lower():
                    strategies.append({
                        'strategy': 'Business mentorship',
                        'description': 'Assign business mentor to provide guidance and support',
                        'priority': 'medium',
                        'timeline': 'First 6 months'
                    })
        
        return strategies
    
    def _determine_monitoring_requirements(self, risk_level: str, risk_factors: List[Dict]) -> Dict[str, Any]:
        """Determine monitoring requirements based on risk"""
        requirements = {
            'frequency': 'monthly',
            'key_metrics': [],
            'reporting_requirements': [],
            'site_visits': False,
            'automated_alerts': []
        }
        
        # Adjust based on risk level
        if risk_level == 'low':
            requirements['frequency'] = 'quarterly'
        elif risk_level == 'medium':
            requirements['frequency'] = 'monthly'
        elif risk_level == 'high':
            requirements['frequency'] = 'bi-weekly'
            requirements['site_visits'] = True
        else:  # very_high
            requirements['frequency'] = 'weekly'
            requirements['site_visits'] = True
        
        # Key metrics to monitor
        requirements['key_metrics'] = [
            'monthly_sales',
            'cash_flow',
            'expense_ratio',
            'payment_status',
            'business_operations'
        ]
        
        # Automated alerts
        requirements['automated_alerts'] = [
            'payment_delay_24h',
            'significant_expense_increase',
            'revenue_drop_20_percent',
            'new_loan_taken'
        ]
        
        # Additional requirements based on risk factors
        for risk_factor in risk_factors:
            if risk_factor['severity'] == 'high':
                requirements['reporting_requirements'].append(
                    f"Monthly report on {risk_factor['factor']}"
                )
        
        return requirements
    
    def _define_early_warning_indicators(self, application_data: Dict, risk_level: str) -> List[Dict]:
        """Define early warning indicators"""
        indicators = [
            {
                'indicator': 'Payment delay',
                'threshold': '3 days overdue',
                'action': 'Immediate contact and follow-up',
                'severity': 'high'
            },
            {
                'indicator': 'Revenue decline',
                'threshold': '20% month-over-month decrease',
                'action': 'Business assessment and support',
                'severity': 'medium'
            },
            {
                'indicator': 'Expense spike',
                'threshold': '30% increase in monthly expenses',
                'action': 'Financial review and counseling',
                'severity': 'medium'
            }
        ]
        
        # Additional indicators for high-risk cases
        if risk_level in ['high', 'very_high']:
            indicators.extend([
                {
                    'indicator': 'New debt taken',
                    'threshold': 'Any new loan or credit facility',
                    'action': 'Immediate review of debt capacity',
                    'severity': 'high'
                },
                {
                    'indicator': 'Business disruption',
                    'threshold': 'Closure for more than 3 days',
                    'action': 'Site visit and assessment',
                    'severity': 'high'
                }
            ])
        
        return indicators
    
    def calculate_portfolio_risk(self, applications_data: List[Dict]) -> Dict[str, Any]:
        """Calculate overall portfolio risk metrics"""
        try:
            if not applications_data:
                return {}
            
            risk_levels = []
            default_probabilities = []
            grades = []
            
            for data in applications_data:
                score = data.get('score', {})
                risk_levels.append(score.get('risk_level', 'medium'))
                default_probabilities.append(score.get('default_probability', 0.15))
                grades.append(score.get('grade', 'C'))
            
            # Calculate portfolio metrics
            portfolio_risk = {
                'total_applications': len(applications_data),
                'risk_distribution': self._calculate_distribution(risk_levels),
                'grade_distribution': self._calculate_distribution(grades),
                'average_default_probability': np.mean(default_probabilities),
                'portfolio_risk_score': self._calculate_portfolio_risk_score(risk_levels, default_probabilities),
                'concentration_risks': self._identify_concentration_risks(applications_data),
                'recommendations': []
            }
            
            # Generate portfolio recommendations
            portfolio_risk['recommendations'] = self._generate_portfolio_recommendations(portfolio_risk)
            
            return portfolio_risk
            
        except Exception as e:
            logger.error(f"Portfolio risk calculation failed: {str(e)}")
            raise
    
    def _calculate_distribution(self, values: List[str]) -> Dict[str, float]:
        """Calculate distribution of categorical values"""
        distribution = {}
        total = len(values)
        
        for value in values:
            distribution[value] = distribution.get(value, 0) + 1
        
        # Convert to percentages
        for key in distribution:
            distribution[key] = (distribution[key] / total) * 100
        
        return distribution
    
    def _calculate_portfolio_risk_score(self, risk_levels: List[str], 
                                      default_probabilities: List[float]) -> float:
        """Calculate overall portfolio risk score"""
        risk_weights = {'low': 1, 'medium': 2, 'high': 3, 'very_high': 4}
        
        weighted_risk = sum([risk_weights.get(risk, 2) for risk in risk_levels])
        max_possible_risk = len(risk_levels) * 4
        
        avg_default_prob = np.mean(default_probabilities)
        
        # Combine weighted risk and average default probability
        portfolio_risk_score = (weighted_risk / max_possible_risk) * 0.6 + avg_default_prob * 0.4
        
        return round(portfolio_risk_score * 100, 2)
    
    def _identify_concentration_risks(self, applications_data: List[Dict]) -> List[Dict]:
        """Identify concentration risks in portfolio"""
        concentrations = []
        
        # Business type concentration
        business_types = {}
        for data in applications_data:
            btype = data.get('application', {}).get('business_data', {}).get('business_type', 'unknown')
            business_types[btype] = business_types.get(btype, 0) + 1
        
        total_apps = len(applications_data)
        for btype, count in business_types.items():
            percentage = (count / total_apps) * 100
            if percentage > 30:  # More than 30% concentration
                concentrations.append({
                    'type': 'business_type',
                    'category': btype,
                    'percentage': percentage,
                    'count': count,
                    'risk_level': 'high' if percentage > 50 else 'medium'
                })
        
        # Geographic concentration (if location data available)
        # Risk level concentration
        risk_levels = {}
        for data in applications_data:
            risk = data.get('score', {}).get('risk_level', 'medium')
            risk_levels[risk] = risk_levels.get(risk, 0) + 1
        
        high_risk_percentage = ((risk_levels.get('high', 0) + risk_levels.get('very_high', 0)) / total_apps) * 100
        if high_risk_percentage > 25:
            concentrations.append({
                'type': 'risk_level',
                'category': 'high_risk',
                'percentage': high_risk_percentage,
                'count': risk_levels.get('high', 0) + risk_levels.get('very_high', 0),
                'risk_level': 'high'
            })
        
        return concentrations
    
    def _generate_portfolio_recommendations(self, portfolio_risk: Dict) -> List[str]:
        """Generate portfolio-level recommendations"""
        recommendations = []
        
        # Risk distribution recommendations
        risk_dist = portfolio_risk.get('risk_distribution', {})
        high_risk_pct = risk_dist.get('high', 0) + risk_dist.get('very_high', 0)
        
        if high_risk_pct > 30:
            recommendations.append("Portfolio has high concentration of risky applications - consider tightening approval criteria")
        
        # Default probability recommendations
        avg_default_prob = portfolio_risk.get('average_default_probability', 0)
        if avg_default_prob > 0.2:
            recommendations.append("Average default probability is high - review scoring model parameters")
        
        # Concentration risk recommendations
        concentrations = portfolio_risk.get('concentration_risks', [])
        for concentration in concentrations:
            if concentration['risk_level'] == 'high':
                recommendations.append(f"High concentration risk in {concentration['category']} - diversify portfolio")
        
        return recommendations
