# apps/credit_scoring/services/borrower_attributes_calculator.py
from decimal import Decimal
from typing import Dict, Any
import logging

from apps.credit_scoring.models import CreditApplication

logger = logging.getLogger(__name__)

class BorrowerAttributesCalculator:
    """
    Calculates Borrower Attributes Score using 5C Credit Model (100 points total):
    - Character (25 points)
    - Capital (15 points)  
    - Capacity (30 points)
    - Collateral (25 points)
    - Conditions (5 points)
    """
    
    def __init__(self):
        self.max_scores = {
            'character': 25,
            'capital': 15,
            'capacity': 30,
            'collateral': 25,
            'conditions': 5
        }
    
    def calculate(self, application: CreditApplication) -> Dict[str, Any]:
        """Calculate total borrower attributes score using 5C model"""
        try:
            # Calculate each C component
            character_score = self._calculate_character(application)
            capital_score = self._calculate_capital(application)
            capacity_score = self._calculate_capacity(application)
            collateral_score = self._calculate_collateral(application)
            conditions_score = self._calculate_conditions(application)
            
            total_score = (character_score['score'] + capital_score['score'] + 
                          capacity_score['score'] + collateral_score['score'] + 
                          conditions_score['score'])
            
            return {
                'total_score': total_score,
                'breakdown': {
                    'character': character_score,
                    'capital': capital_score,
                    'capacity': capacity_score,
                    'collateral': collateral_score,
                    'conditions': conditions_score
                }
            }
            
        except Exception as e:
            logger.error(f"Error calculating borrower attributes: {str(e)}")
            raise
    
    def _calculate_character(self, application: CreditApplication) -> Dict[str, Any]:
        """
        Calculate Character score (25 points)
        Evaluates credit discipline, payment behavior, and reliability
        """
        score_breakdown = {}
        total_score = 0
        
        # 1. Credit History (20 points)
        credit_history_score = self._get_credit_history_score(application)
        score_breakdown['credit_history'] = credit_history_score
        total_score += credit_history_score
        
        # 2. Personal Traits (1 point) - Officer assessment
        # This would typically come from loan officer evaluation
        personal_traits_score = 1  # Placeholder - assuming positive assessment
        score_breakdown['personal_traits'] = personal_traits_score
        total_score += personal_traits_score
        
        # 3. Rent Pay Date (2 points)
        rent_pay_score = self._get_rent_payment_score(application)
        score_breakdown['rent_pay'] = rent_pay_score
        total_score += rent_pay_score
        
        # 4. Bank Transaction Volume (1 point)
        bank_txn_score = 1 if (application.financial_data.bank_transaction_volume_1y or 0) >= 500000 else 0
        score_breakdown['bank_transaction'] = bank_txn_score
        total_score += bank_txn_score
        
        # 5. MFS Transaction Volume (1 point)
        mfs_txn_score = 1 if (application.financial_data.mfs_transaction_volume_monthly or 0) >= 50000 else 0
        score_breakdown['mfs_transaction'] = mfs_txn_score
        total_score += mfs_txn_score
        
        return {
            'score': total_score,
            'max_score': 25,
            'breakdown': score_breakdown
        }
    
    def _get_credit_history_score(self, application: CreditApplication) -> int:
        """Calculate credit history score based on FI Nature, Repaid Amount, and Default Status"""
        if not application.financial_data.existing_loans:
            return 8  # No previous loans, neutral score
        
        total_score = 0
        loan_count = len(application.financial_data.existing_loans)
        
        for loan in application.financial_data.existing_loans:
            loan_score = 0
            
            # FI Nature score
            fi_scores = {
                'supplier': 3,
                'mfi': 4,
                'nbfi': 5,
                'bank': 6,
                'drutoloan': 7
            }
            loan_score += fi_scores.get(loan.fi_type, 3)
            
            # Repaid Amount score
            repaid_percentage = loan.repaid_percentage or 0
            if repaid_percentage >= 90:
                loan_score += 5
            elif repaid_percentage >= 70:
                loan_score += 4
            elif repaid_percentage >= 50:
                loan_score += 3
            elif repaid_percentage >= 25:
                loan_score += 2
            elif repaid_percentage >= 10:
                loan_score += 1
            
            # Default Status score
            status_scores = {
                'on_time': 8,
                'overdue_3_days': 5,
                'overdue_7_days': 4,
                'default': 0
            }
            loan_score += status_scores.get(loan.repayment_status, 4)
            
            total_score += loan_score
        
        # Average score across all loans, max 20 points
        average_score = total_score / loan_count if loan_count > 0 else 0
        return min(20, int(average_score))
    
    def _get_rent_payment_score(self, application: CreditApplication) -> int:
        """Score based on rent payment timing (placeholder logic)"""
        # This would typically come from rent payment history data
        # For now, assuming good payment history
        return 2
    
    def _calculate_capital(self, application: CreditApplication) -> Dict[str, Any]:
        """
        Calculate Capital score (15 points)
        Measures borrower's net worth and financial cushion
        """
        score_breakdown = {}
        total_score = 0
        business = application.business_data
        
        # 1. Total Inventory Value (5 points) - unitary method
        inventory_value = business.inventory_value_present or 0
        inventory_score = min(5, int((inventory_value / 1000000) * 5))  # 10 Lakhs = 5 points
        score_breakdown['inventory_value'] = inventory_score
        total_score += inventory_score
        
        # 2. Rent Advance (2.5 points) - unitary method
        rent_advance = business.rent_advance or 0
        rent_advance_score = min(2.5, (rent_advance / 500000) * 2.5)  # 5 Lakhs = 2.5 points
        score_breakdown['rent_advance'] = rent_advance_score
        total_score += rent_advance_score
        
        # 3. Leverage Ratio (3.5 points)
        leverage_ratio = self._calculate_leverage_ratio_for_capital(application)
        if leverage_ratio <= 20:
            leverage_score = 3.5
        elif leverage_ratio <= 30:
            leverage_score = 2
        elif leverage_ratio <= 40:
            leverage_score = 1
        else:
            leverage_score = 0
        
        score_breakdown['leverage_ratio'] = leverage_score
        total_score += leverage_score
        
        # 4. Current Ratio (4 points)
        current_ratio = self._calculate_current_ratio_for_capital(application)
        if current_ratio <= 20:
            current_ratio_score = 4
        elif current_ratio <= 30:
            current_ratio_score = 3
        elif current_ratio <= 40:
            current_ratio_score = 1
        else:
            current_ratio_score = 0
        
        score_breakdown['current_ratio'] = current_ratio_score
        total_score += current_ratio_score
        
        return {
            'score': total_score,
            'max_score': 15,
            'breakdown': score_breakdown
        }
    
    def _calculate_capacity(self, application: CreditApplication) -> Dict[str, Any]:
        """
        Calculate Capacity score (30 points)
        Represents repayment ability based on income, expenses, and operational performance
        """
        score_breakdown = {}
        total_score = 0
        business = application.business_data
        
        # Define scoring thresholds for capacity factors
        capacity_factors = [
            ('daily_sales', business.average_daily_sales, [35000, 20000, 7000]),
            ('monthly_sales', business.last_month_sales, [1000000, 600000, 300000]),
            ('other_income', business.other_income_last_month, [100000, 50000, 30000]),
            ('cod_avg', business.cash_on_delivery_12m_avg, [300000, 200000, 100000])
        ]
        
        # Score each capacity factor (3 points each)
        for factor_name, value, thresholds in capacity_factors:
            if value and value >= thresholds[0]:
                factor_score = 3
            elif value and value >= thresholds[1]:
                factor_score = 2
            elif value and value >= thresholds[2]:
                factor_score = 1
            else:
                factor_score = 0
            
            score_breakdown[factor_name] = factor_score
            total_score += factor_score
        
        # Business Expense % of Revenue (3 points)
        if business.last_month_sales and business.last_month_sales > 0:
            expense_ratio = ((business.total_expense_last_month or 0) / business.last_month_sales) * 100
            if expense_ratio <= 30:
                expense_score = 3
            elif expense_ratio <= 40:
                expense_score = 2
            elif expense_ratio <= 50:
                expense_score = 1
            else:
                expense_score = 0
        else:
            expense_score = 0
        
        score_breakdown['expense_ratio'] = expense_score
        total_score += expense_score
        
        # Personal Expense % of Income (3 points)
        if application.financial_data.monthly_income and application.financial_data.monthly_income > 0:
            personal_expense_ratio = ((business.personal_expense or 0) / application.financial_data.monthly_income) * 100
            if personal_expense_ratio <= 25:
                personal_expense_score = 3
            elif personal_expense_ratio <= 30:
                personal_expense_score = 2
            elif personal_expense_ratio <= 35:
                personal_expense_score = 1
            else:
                personal_expense_score = 0
        else:
            personal_expense_score = 0
        
        score_breakdown['personal_expense'] = personal_expense_score
        total_score += personal_expense_score
        
        # Profitability Ratio (3 points)
        revenue = business.sales_history_12m_avg or business.last_month_sales or 0
        expenses = business.expense_history_12m_avg or business.total_expense_last_month or 0
        if revenue > 0:
            profitability = ((revenue - expenses) / revenue) * 100
            if profitability >= 20:
                prof_score = 3
            elif profitability >= 15:
                prof_score = 2
            elif profitability >= 10:
                prof_score = 1
            else:
                prof_score = 0
        else:
            prof_score = 0
        
        score_breakdown['profitability'] = prof_score
        total_score += prof_score
        
        # Interest Coverage Ratio (3 points)
        total_installments = sum([loan.monthly_installment for loan in application.financial_data.existing_loans])
        if application.financial_data.monthly_income and application.financial_data.monthly_income > 0:
            interest_coverage = (total_installments / application.financial_data.monthly_income) * 100
            if interest_coverage <= 2.5:
                interest_score = 3
            elif interest_coverage <= 5:
                interest_score = 2
            elif interest_coverage <= 8:
                interest_score = 1
            else:
                interest_score = 0
        else:
            interest_score = 0
        
        score_breakdown['interest_coverage'] = interest_score
        total_score += interest_score
        
        # Liquidity Ratio (3 points)
        if total_installments > 0 and business.average_daily_sales:
            liquidity_ratio = (business.average_daily_sales / total_installments) * 100
            if liquidity_ratio >= 20:
                liquidity_score = 3
            elif liquidity_ratio >= 15:
                liquidity_score = 2
            elif liquidity_ratio >= 10:
                liquidity_score = 1
            else:
                liquidity_score = 0
        else:
            liquidity_score = 3  # No debt means good liquidity
        
        score_breakdown['liquidity'] = liquidity_score
        total_score += liquidity_score
        
        # Debt-Burden Ratio (3 points)
        gross_profit = revenue - expenses + (business.other_income_last_month or 0)
        if gross_profit > 0:
            dbr = (total_installments / gross_profit) * 100
            if dbr <= 30:
                dbr_score = 3
            elif dbr <= 40:
                dbr_score = 2
            elif dbr <= 50:
                dbr_score = 1
            else:
                dbr_score = 0
        else:
            dbr_score = 0
        
        score_breakdown['debt_burden'] = dbr_score
        total_score += dbr_score
        
        return {
            'score': total_score,
            'max_score': 30,
            'breakdown': score_breakdown
        }
    
    def _calculate_collateral(self, application: CreditApplication) -> Dict[str, Any]:
        """
        Calculate Collateral score (25 points)
        Secures the loan against default
        """
        score_breakdown = {}
        total_score = 0
        business = application.business_data
        borrower = application.borrower_info
        
        # 1. Total Inventory Value (5 points)
        inventory_value = business.inventory_value_present or 0
        inventory_score = 5 if inventory_value >= 1000000 else 0  # 10 Lakhs
        score_breakdown['inventory_value'] = inventory_score
        total_score += inventory_score
        
        # 2. Years of Residency (1 point)
        residency_score = 1 if (borrower.years_of_residency or 0) >= 5 else 0
        score_breakdown['years_of_residency'] = residency_score
        total_score += residency_score
        
        # 3. Guarantor Category (10 points)
        guarantor_scores = {'strong': 10, 'medium': 5, 'weak': 0}
        guarantor_score = guarantor_scores.get(borrower.guarantor_category, 0)
        score_breakdown['guarantor_category'] = guarantor_score
        total_score += guarantor_score
        
        # 4. Residency Status (7 points)
        residency_status_score = 7 if borrower.residency_status == 'permanent' else 0
        score_breakdown['residency_status'] = residency_status_score
        total_score += residency_status_score
        
        # 5. Rent Advance (1 point)
        rent_advance_score = 1 if (business.rent_advance or 0) >= 500000 else 0  # 5 Lakhs
        score_breakdown['rent_advance'] = rent_advance_score
        total_score += rent_advance_score
        
        # 6. Years of Operation (1 point)
        operation_score = 1 if (business.years_of_operation or 0) >= 5 else 0
        score_breakdown['years_of_operation'] = operation_score
        total_score += operation_score
        
        return {
            'score': total_score,
            'max_score': 25,
            'breakdown': score_breakdown
        }
    
    def _calculate_conditions(self, application: CreditApplication) -> Dict[str, Any]:
        """
        Calculate Conditions score (5 points)
        Represents industry/business environment risks
        """
        score_breakdown = {}
        total_score = 0
        business = application.business_data
        
        # 1. Seller Type (2 points)
        seller_score = 2 if business.seller_type == 'wholesaler' else 1
        score_breakdown['seller_type'] = seller_score
        total_score += seller_score
        
        # 2. Business Type (3 points)
        business_type_score = self._get_business_type_score(business.business_type)
        score_breakdown['business_type'] = business_type_score
        total_score += business_type_score
        
        return {
            'score': total_score,
            'max_score': 5,
            'breakdown': score_breakdown
        }
    
    def _get_business_type_score(self, business_type: str) -> int:
        """Get business type score based on risk category"""
        high_risk_types = ['grocery_shop', 'cosmetics', 'medicine', 'clothing_shop', 
                          'wholesalers', 'bakery', 'restaurant', 'library', 'hardware', 
                          'sanitary', 'garage', 'super_shop', 'mobile_shop', 'accessories', 'servicing']
        medium_risk_types = ['tea_stall', 'motor_parts', 'sports_shop', 'tailor', 'shoe_seller', 'plastic_items']
        low_risk_types = ['salon', 'ladies_parlor', 'poultry_shop', 'vegetable_shop']
        red_flag_types = ['wood_shop', 'sub_contract_factory', 'gold_ornaments_seller']
        
        business_type_normalized = business_type.lower().replace(' ', '_')
        
        if business_type_normalized in high_risk_types:
            return 3
        elif business_type_normalized in medium_risk_types:
            return 2
        elif business_type_normalized in low_risk_types:
            return 1
        elif business_type_normalized in red_flag_types:
            return 0
        else:
            return 2  # Default to medium if not categorized
    
    def _calculate_leverage_ratio_for_capital(self, application: CreditApplication) -> float:
        """Calculate leverage ratio for capital assessment"""
        business = application.business_data
        financial = application.financial_data
        
        # Calculate total assets
        total_assets = (business.inventory_value_present or 0) + (business.rent_advance or 0) + (financial.cash_equivalent or 0)
        
        if total_assets <= 0:
            return 100  # High risk if no assets
        
        # Calculate total debt
        total_debt = sum([loan.outstanding_loan for loan in financial.existing_loans])
        
        return (total_debt / total_assets) * 100
    
    def _calculate_current_ratio_for_capital(self, application: CreditApplication) -> float:
        """Calculate current ratio for capital assessment"""
        business = application.business_data
        financial = application.financial_data
        
        # Calculate total inflow
        total_inflow = (financial.monthly_income or 0) + (business.other_income_last_month or 0)
        
        if total_inflow <= 0:
            return 100  # High risk if no income
        
        # Calculate total outflow
        total_installments = sum([loan.monthly_installment for loan in financial.existing_loans])
        total_outflow = total_installments + (business.personal_expense or 0)
        
        return (total_outflow / total_inflow) * 100
    
    def get_5c_analysis(self, breakdown: Dict[str, Any]) -> Dict[str, Any]:
        """Get comprehensive 5C analysis with insights"""
        analysis = {
            'strengths': [],
            'weaknesses': [],
            'recommendations': [],
            'risk_factors': []
        }
        
        # Analyze Character
        character = breakdown['character']
        if character['score'] >= 20:
            analysis['strengths'].append("Strong credit history and payment discipline")
        elif character['score'] <= 15:
            analysis['weaknesses'].append("Poor credit history or payment behavior")
            analysis['risk_factors'].append("Character risk - payment discipline concerns")
        
        # Analyze Capital
        capital = breakdown['capital']
        if capital['score'] >= 12:
            analysis['strengths'].append("Good capital base and asset backing")
        elif capital['score'] <= 8:
            analysis['weaknesses'].append("Limited capital and asset base")
            analysis['recommendations'].append("Consider additional collateral or guarantor strengthening")
        
        # Analyze Capacity
        capacity = breakdown['capacity']
        if capacity['score'] >= 24:
            analysis['strengths'].append("Strong repayment capacity and cash flow")
        elif capacity['score'] <= 18:
            analysis['weaknesses'].append("Limited repayment capacity")
            analysis['risk_factors'].append("Capacity risk - cash flow concerns")
            analysis['recommendations'].append("Review loan amount and tenure to match capacity")
        
        # Analyze Collateral
        collateral = breakdown['collateral']
        if collateral['score'] >= 20:
            analysis['strengths'].append("Adequate collateral and security")
        elif collateral['score'] <= 15:
            analysis['weaknesses'].append("Insufficient collateral backing")
            analysis['recommendations'].append("Require additional collateral or security")
        
        # Analyze Conditions
        conditions = breakdown['conditions']
        if conditions['score'] <= 2:
            analysis['risk_factors'].append("Industry/business environment risks")
            analysis['recommendations'].append("Enhanced monitoring due to business conditions")
        
        return analysis