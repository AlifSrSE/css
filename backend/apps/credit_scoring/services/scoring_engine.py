# apps/credit_scoring/services/scoring_engine.py
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Tuple, Any
import logging
from datetime import datetime

from apps.credit_scoring.models import CreditApplication, CreditScore, RedFlag, RatioScore
from .data_points_calculator import DataPointsCalculator
from .credit_ratios_calculator import CreditRatiosCalculator
from .borrower_attributes_calculator import BorrowerAttributesCalculator
from .psychometric_analyzer import PsychometricAnalyzer

logger = logging.getLogger(__name__)

class CreditScoringEngine:
    """
    Main Credit Scoring Engine that orchestrates all scoring components
    Based on the documentation's scoring model
    """
    
    def __init__(self):
        self.data_points_calculator = DataPointsCalculator()
        self.credit_ratios_calculator = CreditRatiosCalculator()
        self.borrower_attributes_calculator = BorrowerAttributesCalculator()
        self.psychometric_analyzer = PsychometricAnalyzer()
        
        # Default weights as per documentation
        self.weights = {
            'data_points': 30,      # DPW
            'credit_ratios': 20,    # CRW
            'borrower_attributes': 48,  # 5CW
            'psychometric': 2       # PSW
        }
        
        # Grade thresholds
        self.grade_thresholds = {
            'A': 65,
            'B': 51,
            'C': 35,
            'R': 0
        }
    
    def calculate_credit_score(self, application: CreditApplication, 
                             psychometric_responses: Dict = None) -> CreditScore:
        """
        Calculate complete credit score for an application
        """
        try:
            logger.info(f"Starting credit score calculation for application: {application.application_id}")
            
            # 1. Calculate Data Points Score (100 points)
            data_points_result = self.data_points_calculator.calculate(application)
            
            # 2. Calculate Credit Ratios Score
            credit_ratios_result = self.credit_ratios_calculator.calculate(application)
            
            # 3. Calculate Borrower Attributes Score (100 points)
            borrower_attributes_result = self.borrower_attributes_calculator.calculate(application)
            
            # 4. Process Psychometric Test (if provided)
            psychometric_result = None
            if psychometric_responses:
                psychometric_result = self.psychometric_analyzer.analyze(psychometric_responses)
            
            # 5. Calculate Final Score
            final_score, grade, slab_adjustment = self._calculate_final_score(
                data_points_result['total_score'],
                credit_ratios_result['total_score'],
                borrower_attributes_result['total_score'],
                psychometric_result['total_score'] if psychometric_result else 60
            )
            
            # 6. Identify Red Flags
            red_flags = self._identify_red_flags(application, 
                                               data_points_result, 
                                               credit_ratios_result,
                                               borrower_attributes_result)
            
            # 7. Calculate Max Loan Amount
            max_loan_amount = self._calculate_max_loan_amount(application, grade, final_score)
            
            # 8. Generate Recommendations
            recommendations = self._generate_recommendations(application, final_score, grade, red_flags)
            
            # 9. Assess Risk Level
            risk_level, default_probability = self._assess_risk(final_score, red_flags)
            
            # Create Credit Score Document
            credit_score = CreditScore(
                application=application,
                data_points_score=data_points_result['total_score'],
                data_points_breakdown=data_points_result['breakdown'],
                credit_ratios_score=credit_ratios_result['total_score'],
                credit_ratios_breakdown=credit_ratios_result['ratios'],
                borrower_attributes_score=borrower_attributes_result['total_score'],
                borrower_attributes_breakdown=borrower_attributes_result['breakdown'],
                psychometric_result=psychometric_result,
                total_points=final_score,
                grade=grade,
                loan_slab_adjustment=slab_adjustment,
                risk_level=risk_level,
                default_probability=default_probability,
                red_flags=red_flags,
                recommendations=recommendations,
                max_loan_amount=max_loan_amount,
                calculated_at=datetime.utcnow(),
                calculated_by='system',
                version='1.0'
            )
            
            credit_score.save()
            
            logger.info(f"Credit score calculated successfully. Grade: {grade}, Score: {final_score}")
            return credit_score
            
        except Exception as e:
            logger.error(f"Error calculating credit score: {str(e)}")
            raise Exception(f"Credit scoring failed: {str(e)}")
    
    def _calculate_final_score(self, data_points: int, credit_ratios: float, 
                              borrower_attributes: int, psychometric: int) -> Tuple[float, str, str]:
        """
        Calculate final score using weighted formula:
        Total Points = (DP * DPW + CR * CRW + BA * 5CW + PS * PSW) / 100
        """
        total_points = (
            (data_points * self.weights['data_points']) +
            (credit_ratios * self.weights['credit_ratios']) +
            (borrower_attributes * self.weights['borrower_attributes']) +
            (psychometric * self.weights['psychometric'])
        ) / 100
        
        # Round to 2 decimal places
        total_points = float(Decimal(str(total_points)).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        ))
        
        # Determine grade and slab adjustment
        if total_points >= self.grade_thresholds['A']:
            grade = 'A'
            slab_adjustment = 'ONE SLAB UP'
        elif total_points >= self.grade_thresholds['B']:
            grade = 'B'
            slab_adjustment = 'SAME SLAB'
        elif total_points >= self.grade_thresholds['C']:
            grade = 'C'
            slab_adjustment = 'ONE SLAB DOWN'
        else:
            grade = 'R'
            slab_adjustment = 'REJECTED'
        
        return total_points, grade, slab_adjustment
    
    def _identify_red_flags(self, application: CreditApplication, 
                           data_points_result: Dict, credit_ratios_result: Dict,
                           borrower_attributes_result: Dict) -> List[RedFlag]:
        """
        Identify hard and soft red flags based on application data
        """
        red_flags = []
        
        # Hard Red Flags (Auto-reject)
        hard_flags = self._check_hard_red_flags(application, credit_ratios_result)
        red_flags.extend(hard_flags)
        
        # Soft Red Flags (Grade limitation)
        soft_flags = self._check_soft_red_flags(application, data_points_result)
        red_flags.extend(soft_flags)
        
        return red_flags
    
    def _check_hard_red_flags(self, application: CreditApplication, 
                             credit_ratios: Dict) -> List[RedFlag]:
        """Check for hard red flags that cause automatic rejection"""
        hard_flags = []
        
        # Check for active default/NPL
        for loan in application.financial_data.existing_loans:
            if loan.repayment_status == 'default':
                hard_flags.append(RedFlag(
                    flag_type='hard',
                    flag_name='Active Default',
                    description=f'Active default with {loan.fi_name}',
                    severity='critical',
                    impact='Auto-reject application'
                ))
        
        # Check Revenue < Installment obligation
        total_installments = sum([loan.monthly_installment for loan in application.financial_data.existing_loans])
        monthly_revenue = application.business_data.last_month_sales / 30 if application.business_data.last_month_sales else 0
        
        if monthly_revenue > 0 and total_installments > monthly_revenue:
            hard_flags.append(RedFlag(
                flag_type='hard',
                flag_name='Revenue Below Obligations',
                description='Monthly revenue less than existing installment obligations',
                severity='critical',
                impact='Auto-reject application'
            ))
        
        # Check DBR >= 60%
        for ratio in credit_ratios.get('ratios', []):
            if ratio.ratio_name == 'debt_burden' and ratio.ratio_value >= 60:
                hard_flags.append(RedFlag(
                    flag_type='hard',
                    flag_name='High Debt Burden',
                    description=f'Debt-to-burden ratio: {ratio.ratio_value}%',
                    severity='critical',
                    impact='Auto-reject application'
                ))
        
        return hard_flags
    
    def _check_soft_red_flags(self, application: CreditApplication, 
                             data_points: Dict) -> List[RedFlag]:
        """Check for soft red flags that limit grade"""
        soft_flags = []
        
        # Weak guarantor
        if application.borrower_info.guarantor_category == 'weak':
            soft_flags.append(RedFlag(
                flag_type='soft',
                flag_name='Weak Guarantor',
                description='Guarantor has weak financial standing',
                severity='medium',
                impact='Grade capped at B'
            ))
        
        # Business/license age < 2 years
        if application.business_data.years_of_operation < 2:
            soft_flags.append(RedFlag(
                flag_type='soft',
                flag_name='New Business',
                description=f'Business operational for only {application.business_data.years_of_operation} years',
                severity='medium',
                impact='Grade capped at B'
            ))
        
        return soft_flags
    
    def _calculate_max_loan_amount(self, application: CreditApplication, 
                                  grade: str, score: float) -> Decimal:
        """
        Calculate maximum loan amount based on income, DBR, assets, and grade
        """
        monthly_income = application.financial_data.monthly_income or 0
        total_assets = application.financial_data.total_assets or 0
        existing_obligations = sum([loan.monthly_installment for loan in application.financial_data.existing_loans])
        
        # Income-based cap (Monthly Income * 6 * Loan Term years)
        # Assuming 2-year term for calculation
        income_based_cap = monthly_income * 6 * 2
        
        # DBR-based cap (60% of available income * 12 * term)
        available_income = monthly_income - existing_obligations
        dbr_based_cap = (available_income * 0.6) * 12 * 2
        
        # Asset-based cap (60% of total assets)
        asset_based_cap = total_assets * 0.6
        
        # Take minimum of all caps
        base_amount = min(income_based_cap, dbr_based_cap, asset_based_cap)
        
        # Apply grade adjustment
        grade_multipliers = {'A': 1.0, 'B': 0.85, 'C': 0.6, 'R': 0.0}
        final_amount = base_amount * grade_multipliers.get(grade, 0.0)
        
        return Decimal(str(max(0, final_amount))).quantize(Decimal('0.01'))
    
    def _generate_recommendations(self, application: CreditApplication, 
                                 score: float, grade: str, red_flags: List[RedFlag]) -> List[str]:
        """Generate actionable recommendations based on scoring results"""
        recommendations = []
        
        if grade == 'A':
            recommendations.append("Eligible for premium loan terms with reduced interest rates")
            recommendations.append("Consider offering increased loan limits")
            recommendations.append("Fast-track application processing recommended")
        
        elif grade == 'B':
            recommendations.append("Approve under standard loan terms")
            recommendations.append("Regular monitoring recommended")
            
        elif grade == 'C':
            recommendations.append("Approve with restricted terms and higher interest rates")
            recommendations.append("Implement enhanced monitoring and follow-up")
            recommendations.append("Consider requiring additional collateral")
            
        else:  # Grade R
            recommendations.append("Reject application due to high risk")
            recommendations.append("Suggest reapplication after addressing identified issues")
        
        # Add specific recommendations based on red flags
        for flag in red_flags:
            if flag.flag_type == 'soft':
                if 'Weak Guarantor' in flag.flag_name:
                    recommendations.append("Recommend stronger guarantor or additional collateral")
                elif 'New Business' in flag.flag_name:
                    recommendations.append("Consider shorter loan tenure with regular reviews")
        
        return recommendations
    
    def _assess_risk(self, score: float, red_flags: List[RedFlag]) -> Tuple[str, float]:
        """Assess overall risk level and default probability"""
        
        # Base risk assessment on score
        if score >= 75:
            base_risk = 'low'
            base_probability = 0.05
        elif score >= 60:
            base_risk = 'medium'
            base_probability = 0.15
        elif score >= 40:
            base_risk = 'high'
            base_probability = 0.30
        else:
            base_risk = 'very_high'
            base_probability = 0.50
        
        # Adjust based on red flags
        hard_flags_count = len([f for f in red_flags if f.flag_type == 'hard'])
        soft_flags_count = len([f for f in red_flags if f.flag_type == 'soft'])
        
        # Increase probability for red flags
        probability_adjustment = (hard_flags_count * 0.20) + (soft_flags_count * 0.05)
        adjusted_probability = min(0.95, base_probability + probability_adjustment)
        
        # Upgrade risk level if too many flags
        if hard_flags_count > 0:
            risk_level = 'very_high'
        elif soft_flags_count >= 3:
            risk_level = 'high'
        else:
            risk_level = base_risk
        
        return risk_level, round(adjusted_probability, 3)
    
    def update_scoring_weights(self, new_weights: Dict[str, int]):
        """Update scoring weights (for admin configuration)"""
        # Validate weights sum to 100
        total_weight = sum(new_weights.values())
        if total_weight != 100:
            raise ValueError(f"Weights must sum to 100, got {total_weight}")
        
        self.weights.update(new_weights)
        logger.info(f"Scoring weights updated: {self.weights}")
    
    def update_grade_thresholds(self, new_thresholds: Dict[str, float]):
        """Update grade thresholds (for admin configuration)"""
        self.grade_thresholds.update(new_thresholds)
        logger.info(f"Grade thresholds updated: {self.grade_thresholds}")
    
    def get_scoring_summary(self, credit_score: CreditScore) -> Dict[str, Any]:
        """Get a comprehensive scoring summary for reporting"""
        return {
            'application_id': credit_score.application.application_id,
            'final_score': float(credit_score.total_points),
            'grade': credit_score.grade,
            'risk_level': credit_score.risk_level,
            'component_scores': {
                'data_points': credit_score.data_points_score,
                'credit_ratios': float(credit_score.credit_ratios_score),
                'borrower_attributes': credit_score.borrower_attributes_score,
                'psychometric': credit_score.psychometric_result.total_score if credit_score.psychometric_result else None
            },
            'max_loan_amount': float(credit_score.max_loan_amount),
            'red_flags_count': {
                'hard': len([f for f in credit_score.red_flags if f.flag_type == 'hard']),
                'soft': len([f for f in credit_score.red_flags if f.flag_type == 'soft'])
            },
            'recommendations_count': len(credit_score.recommendations),
            'calculated_at': credit_score.calculated_at.isoformat(),
        }