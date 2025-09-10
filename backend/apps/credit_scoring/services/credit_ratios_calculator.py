# apps/credit_scoring/services/credit_ratios_calculator.py
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Any
import logging

from apps.credit_scoring.models import CreditApplication, RatioScore

logger = logging.getLogger(__name__)

class CreditRatiosCalculator:
    """
    Calculates Credit Ratios Score based on financial health metrics:
    - Profitability Ratio (22 points)
    - Debt-Burden Ratio (20 points)
    - Leverage Ratio (18 points)
    - Interest/Income Ratio (12 points)
    - Liquidity Ratio (16 points)
    - Current Ratio (12 points)
    """
    
    def __init__(self):
        self.max_scores = {
            'profitability': 22,
            'debt_burden': 20,
            'leverage': 18,
            'interest_income': 12,
            'liquidity': 16,
            'current': 12
        }
    
    def calculate(self, application: CreditApplication) -> Dict[str, Any]:
        """Calculate all credit ratios and return total score"""
        try:
            ratios = []
            
            # Calculate each ratio
            profitability_ratio = self._calculate_profitability_ratio(application)
            ratios.append(profitability_ratio)
            
            debt_burden_ratio = self._calculate_debt_burden_ratio(application)
            ratios.append(debt_burden_ratio)
            
            leverage_ratio = self._calculate_leverage_ratio(application)
            ratios.append(leverage_ratio)
            
            interest_income_ratio = self._calculate_interest_income_ratio(application)
            ratios.append(interest_income_ratio)
            
            liquidity_ratio = self._calculate_liquidity_ratio(application)
            ratios.append(liquidity_ratio)
            
            current_ratio = self._calculate_current_ratio(application)
            ratios.append(current_ratio)
            
            # Calculate total score as average of all ratios
            total_score = sum([ratio.score for ratio in ratios]) / len(ratios)
            
            return {
                'total_score': round(total_score, 2),
                'ratios': ratios,
                'breakdown': {ratio.ratio_name: ratio.score for ratio in ratios}
            }
            
        except Exception as e:
            logger.error(f"Error calculating credit ratios: {str(e)}")
            raise
    
    def _calculate_profitability_ratio(self, application: CreditApplication) -> RatioScore:
        """
        Profitability Ratio = Gross Profit / Revenue
        Thresholds: Wholesaler ≥ 3%, Retailer ≥ 10%
        """
        business = application.business_data
        
        # Calculate gross profit percentage
        revenue = business.sales_history_12m_avg or business.last_month_sales or 0
        expenses = business.expense_history_12m_avg or business.total_expense_last_month or 0
        
        if revenue <= 0:
            return RatioScore(
                ratio_name='profitability',
                ratio_value=0,
                score=0,
                band='red',
                threshold_met=False
            )
        
        gross_profit = revenue - expenses
        profitability_percentage = (gross_profit / revenue) * 100
        
        # Determine threshold based on seller type
        threshold = 3.0 if business.seller_type == 'wholesaler' else 10.0
        
        # Score based on bands
        if profitability_percentage >= threshold:
            score = 22
            band = 'green'
            threshold_met = True
        elif profitability_percentage >= (threshold * 0.8):  # Within 20% of threshold
            score = 13
            band = 'amber'
            threshold_met = False
        else:
            score = 0
            band = 'red'
            threshold_met = False
        
        return RatioScore(
            ratio_name='profitability',
            ratio_value=round(profitability_percentage, 2),
            score=score,
            band=band,
            threshold_met=threshold_met
        )
    
    def _calculate_debt_burden_ratio(self, application: CreditApplication) -> RatioScore:
        """
        Debt-Burden Ratio = Total Monthly Installments / Gross Margin
        Threshold: ≤ 60%
        """
        business = application.business_data
        financial = application.financial_data
        
        # Calculate gross margin (income)
        revenue = business.sales_history_12m_avg or business.last_month_sales or 0
        expenses = business.expense_history_12m_avg or business.total_expense_last_month or 0
        other_income = business.other_income_last_month or 0
        gross_margin = (revenue - expenses) + other_income
        
        if gross_margin <= 0:
            return RatioScore(
                ratio_name='debt_burden',
                ratio_value=0,
                score=0,
                band='red',
                threshold_met=False
            )
        
        # Calculate total monthly installments
        total_installments = sum([loan.monthly_installment for loan in financial.existing_loans])
        
        dbr_percentage = (total_installments / gross_margin) * 100
        
        # Score based on bands
        if dbr_percentage <= 50:
            score = 20
            band = 'green'
            threshold_met = True
        elif dbr_percentage <= 60:
            score = 12
            band = 'amber'
            threshold_met = False
        else:
            score = 0
            band = 'red'
            threshold_met = False
        
        return RatioScore(
            ratio_name='debt_burden',
            ratio_value=round(dbr_percentage, 2),
            score=score,
            band=band,
            threshold_met=threshold_met
        )
    
    def _calculate_leverage_ratio(self, application: CreditApplication) -> RatioScore:
        """
        Leverage Ratio = Total Debt / Total Assets
        Threshold: ≤ 60%
        """
        business = application.business_data
        financial = application.financial_data
        
        # Calculate total assets
        inventory_value = business.inventory_value_present or 0
        rent_advance = business.rent_advance or 0
        cash_equivalent = financial.cash_equivalent or 0
        total_assets = inventory_value + rent_advance + cash_equivalent
        
        if total_assets <= 0:
            return RatioScore(
                ratio_name='leverage',
                ratio_value=0,
                score=0,
                band='red',
                threshold_met=False
            )
        
        # Calculate total debt (outstanding loans)
        total_debt = sum([loan.outstanding_loan for loan in financial.existing_loans])
        
        leverage_percentage = (total_debt / total_assets) * 100
        
        # Score based on bands
        if leverage_percentage <= 45:
            score = 18
            band = 'green'
            threshold_met = True
        elif leverage_percentage <= 60:
            score = 10
            band = 'amber'
            threshold_met = False
        else:
            score = 0
            band = 'red'
            threshold_met = False
        
        return RatioScore(
            ratio_name='leverage',
            ratio_value=round(leverage_percentage, 2),
            score=score,
            band=band,
            threshold_met=threshold_met
        )
    
    def _calculate_interest_income_ratio(self, application: CreditApplication) -> RatioScore:
        """
        Interest/Income Ratio = Interest Payments / Total Income
        Threshold: ≤ 10%
        """
        business = application.business_data
        financial = application.financial_data
        
        # Calculate total income
        revenue = business.sales_history_12m_avg or business.last_month_sales or 0
        other_income = business.other_income_last_month or 0
        total_income = revenue + other_income
        
        if total_income <= 0:
            return RatioScore(
                ratio_name='interest_income',
                ratio_value=0,
                score=0,
                band='red',
                threshold_met=False
            )
        
        # Calculate total interest payments (estimated as 15% of installments)
        total_installments = sum([loan.monthly_installment for loan in financial.existing_loans])
        estimated_interest = total_installments * 0.15  # Rough estimate
        
        interest_ratio_percentage = (estimated_interest / total_income) * 100
        
        # Score based on bands
        if interest_ratio_percentage <= 8:
            score = 12
            band = 'green'
            threshold_met = True
        elif interest_ratio_percentage <= 10:
            score = 7
            band = 'amber'
            threshold_met = False
        else:
            score = 0
            band = 'red'
            threshold_met = False
        
        return RatioScore(
            ratio_name='interest_income',
            ratio_value=round(interest_ratio_percentage, 2),
            score=score,
            band=band,
            threshold_met=threshold_met
        )
    
    def _calculate_liquidity_ratio(self, application: CreditApplication) -> RatioScore:
        """
        Liquidity Ratio = (Cash + Cash Equivalent) / Monthly Installments
        Threshold: ≥ 20%
        """
        business = application.business_data
        financial = application.financial_data
        
        # Calculate cash equivalent (using average daily sales as proxy)
        daily_sales = business.average_daily_sales or 0
        cash_equivalent = financial.cash_equivalent or daily_sales
        
        # Calculate monthly installments
        monthly_installments = sum([loan.monthly_installment for loan in financial.existing_loans])
        
        if monthly_installments <= 0:
            return RatioScore(
                ratio_name='liquidity',
                ratio_value=100,  # No debt means high liquidity
                score=16,
                band='green',
                threshold_met=True
            )
        
        liquidity_percentage = (cash_equivalent / monthly_installments) * 100
        
        # Score based on bands
        if liquidity_percentage >= 35:
            score = 16
            band = 'green'
            threshold_met = True
        elif liquidity_percentage >= 20:
            score = 9
            band = 'amber'
            threshold_met = True
        else:
            score = 0
            band = 'red'
            threshold_met = False
        
        return RatioScore(
            ratio_name='liquidity',
            ratio_value=round(liquidity_percentage, 2),
            score=score,
            band=band,
            threshold_met=threshold_met
        )
    
    def _calculate_current_ratio(self, application: CreditApplication) -> RatioScore:
        """
        Current Ratio = (EMI + Personal Expenses) / (Income + Other Income)
        Threshold: ≤ 60%
        """
        business = application.business_data
        financial = application.financial_data
        
        # Calculate total inflow
        income = financial.monthly_income or 0
        other_income = business.other_income_last_month or 0
        total_inflow = income + other_income
        
        if total_inflow <= 0:
            return RatioScore(
                ratio_name='current',
                ratio_value=0,
                score=0,
                band='red',
                threshold_met=False
            )
        
        # Calculate total outflow
        monthly_installments = sum([loan.monthly_installment for loan in financial.existing_loans])
        personal_expenses = business.personal_expense or 0
        total_outflow = monthly_installments + personal_expenses
        
        current_ratio_percentage = (total_outflow / total_inflow) * 100
        
        # Score based on bands
        if current_ratio_percentage <= 45:
            score = 12
            band = 'green'
            threshold_met = True
        elif current_ratio_percentage <= 60:
            score = 7
            band = 'amber'
            threshold_met = False
        else:
            score = 0
            band = 'red'
            threshold_met = False
        
        return RatioScore(
            ratio_name='current',
            ratio_value=round(current_ratio_percentage, 2),
            score=score,
            band=band,
            threshold_met=threshold_met
        )
    
    def get_ratio_analysis(self, ratios: List[RatioScore]) -> Dict[str, Any]:
        """Get comprehensive analysis of all ratios"""
        analysis = {
            'total_ratios': len(ratios),
            'green_ratios': len([r for r in ratios if r.band == 'green']),
            'amber_ratios': len([r for r in ratios if r.band == 'amber']),
            'red_ratios': len([r for r in ratios if r.band == 'red']),
            'thresholds_met': len([r for r in ratios if r.threshold_met]),
            'average_score': sum([r.score for r in ratios]) / len(ratios) if ratios else 0,
            'risk_indicators': []
        }
        
        # Identify risk indicators
        for ratio in ratios:
            if ratio.band == 'red':
                analysis['risk_indicators'].append({
                    'ratio': ratio.ratio_name,
                    'value': ratio.ratio_value,
                    'issue': f'Below acceptable threshold'
                })
        
        return analysis