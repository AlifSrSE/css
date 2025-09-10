# apps/credit_scoring/services/data_points_calculator.py
from decimal import Decimal
from typing import Dict, Any
import logging

from apps.credit_scoring.models import CreditApplication

logger = logging.getLogger(__name__)

class DataPointsCalculator:
    """
    Calculates Data Points Score (100 points total)
    Components:
    - Financial Discipline (35 points)
    - Business Performance (45 points)
    - Compliance (20 points)
    """
    
    def __init__(self):
        # Business type scoring matrix
        self.business_type_scores = {
            'high': {
                'types': ['grocery_shop', 'cosmetics', 'medicine', 'clothing_shop', 
                         'wholesalers', 'bakery', 'restaurant', 'library', 'hardware', 
                         'sanitary', 'garage', 'super_shop', 'mobile_shop', 'accessories', 'servicing'],
                'score': 3
            },
            'medium': {
                'types': ['tea_stall', 'motor_parts', 'sports_shop', 'tailor', 'shoe_seller', 'plastic_items'],
                'score': 2
            },
            'low': {
                'types': ['salon', 'ladies_parlor', 'poultry_shop', 'vegetable_shop'],
                'score': 1
            },
            'red_flag': {
                'types': ['wood_shop', 'sub_contract_factory', 'gold_ornaments_seller'],
                'score': 0
            }
        }
    
    def calculate(self, application: CreditApplication) -> Dict[str, Any]:
        """Calculate total data points score"""
        try:
            # Calculate each component
            financial_discipline = self._calculate_financial_discipline(application)
            business_performance = self._calculate_business_performance(application)
            compliance = self._calculate_compliance(application)
            
            total_score = financial_discipline['score'] + business_performance['score'] + compliance['score']
            
            return {
                'total_score': total_score,
                'breakdown': {
                    'financial_discipline': financial_discipline,
                    'business_performance': business_performance,
                    'compliance': compliance
                }
            }
        except Exception as e:
            logger.error(f"Error calculating data points score: {str(e)}")
            raise
    
    def _calculate_financial_discipline(self, application: CreditApplication) -> Dict[str, Any]:
        """Calculate Financial Discipline score (35 points)"""
        score_breakdown = {}
        total_score = 0
        
        # 1. FI Nature (10 points)
        fi_nature_score = self._get_fi_nature_score(application)
        score_breakdown['fi_nature'] = fi_nature_score
        total_score += fi_nature_score
        
        # 2. Repayment Amount (10 points)
        repayment_score = self._get_repayment_amount_score(application)
        score_breakdown['repayment_amount'] = repayment_score
        total_score += repayment_score
        
        # 3. Default/Paying Time (10 points)
        payment_time_score = self._get_payment_time_score(application)
        score_breakdown['payment_time'] = payment_time_score
        total_score += payment_time_score
        
        # 4. Rent Pay Date (2 points)
        rent_pay_score = self._get_rent_pay_score(application)
        score_breakdown['rent_pay'] = rent_pay_score
        total_score += rent_pay_score
        
        # 5. Bank Transaction Volume (2 points)
        bank_txn_score = self._get_bank_transaction_score(application)
        score_breakdown['bank_transaction'] = bank_txn_score
        total_score += bank_txn_score
        
        # 6. MFS Transaction Volume (1 point)
        mfs_txn_score = self._get_mfs_transaction_score(application)
        score_breakdown['mfs_transaction'] = mfs_txn_score
        total_score += mfs_txn_score
        
        return {
            'score': total_score,
            'max_score': 35,
            'breakdown': score_breakdown
        }
    
    def _get_fi_nature_score(self, application: CreditApplication) -> int:
        """Score based on Financial Institution types"""
        if not application.financial_data.existing_loans:
            return 0
        
        # Get highest FI type score from existing loans
        max_score = 0
        for loan in application.financial_data.existing_loans:
            fi_scores = {
                'supplier': 5,
                'mfi': 6,
                'nbfi': 8,
                'bank': 9,
                'drutoloan': 10
            }
            score = fi_scores.get(loan.fi_type, 0)
            max_score = max(max_score, score)
        
        return max_score
    
    def _get_repayment_amount_score(self, application: CreditApplication) -> int:
        """Score based on repayment percentage"""
        if not application.financial_data.existing_loans:
            return 0
        
        # Calculate average repayment percentage
        total_repayment = 0
        loan_count = len(application.financial_data.existing_loans)
        
        for loan in application.financial_data.existing_loans:
            total_repayment += loan.repaid_percentage
        
        avg_repayment = total_repayment / loan_count if loan_count > 0 else 0
        
        if avg_repayment >= 90:
            return 10
        elif avg_repayment >= 70:
            return 8
        elif avg_repayment >= 50:
            return 7
        elif avg_repayment >= 25:
            return 5
        else:
            return 0
    
    def _get_payment_time_score(self, application: CreditApplication) -> int:
        """Score based on payment timing"""
        if not application.financial_data.existing_loans:
            return 10  # No existing loans, assume good payment
        
        # Get worst payment status
        worst_status_score = 10
        for loan in application.financial_data.existing_loans:
            status_scores = {
                'on_time': 10,
                'overdue_3_days': 7,
                'overdue_7_days': 5,
                'default': 0
            }
            score = status_scores.get(loan.repayment_status, 0)
            worst_status_score = min(worst_status_score, score)
        
        return worst_status_score
    
    def _get_rent_pay_score(self, application: CreditApplication) -> int:
        """Score based on rent payment timing (before 15th of month)"""
        # This would typically come from external data or user input
        # For now, we'll use a placeholder logic
        return 2  # Assuming rent paid before 15th
    
    def _get_bank_transaction_score(self, application: CreditApplication) -> int:
        """Score based on bank transaction volume"""
        volume = application.financial_data.bank_transaction_volume_1y or 0
        
        if volume >= 500000:
            return 2
        elif volume >= 250000:
            return 1
        else:
            return 0
    
    def _get_mfs_transaction_score(self, application: CreditApplication) -> int:
        """Score based on MFS transaction volume"""
        volume = application.financial_data.mfs_transaction_volume_monthly or 0
        
        return 1 if volume >= 50000 else 0
    
    def _calculate_business_performance(self, application: CreditApplication) -> Dict[str, Any]:
        """Calculate Business Performance score (45 points)"""
        score_breakdown = {}
        total_score = 0
        
        # 1. Business Type (3 points)
        business_type_score = self._get_business_type_score(application.business_data.business_type)
        score_breakdown['business_type'] = business_type_score
        total_score += business_type_score
        
        # 2. Other Business Performance Factors (42 points)
        performance_factors = self._calculate_performance_factors(application)
        score_breakdown.update(performance_factors['breakdown'])
        total_score += performance_factors['score']
        
        return {
            'score': total_score,
            'max_score': 45,
            'breakdown': score_breakdown
        }
    
    def _get_business_type_score(self, business_type: str) -> int:
        """Get score based on business type"""
        business_type_lower = business_type.lower().replace(' ', '_')
        
        for category, data in self.business_type_scores.items():
            if business_type_lower in data['types']:
                return data['score']
        
        return 1  # Default to medium if not found
    
    def _calculate_performance_factors(self, application: CreditApplication) -> Dict[str, Any]:
        """Calculate business performance factors (42 points)"""
        business = application.business_data
        score_breakdown = {}
        total_score = 0
        
        # Seller Type (2 points)
        seller_score = 2 if business.seller_type == 'wholesaler' else 1
        score_breakdown['seller_type'] = seller_score
        total_score += seller_score
        
        # Inventory Value (5 points)
        inventory_score = self._score_by_thresholds(
            business.inventory_value_present, [1000000, 600000, 400000], [5, 3, 2]
        )
        score_breakdown['inventory_value'] = inventory_score
        total_score += inventory_score
        
        # Product Purchase Price (3 points)
        purchase_score = self._score_by_thresholds(
            business.product_purchase_last_month, [500000, 300000, 150000], [3, 2, 1]
        )
        score_breakdown['product_purchase'] = purchase_score
        total_score += purchase_score
        
        # Stock History (3 points)
        stock_score = self._score_by_thresholds(
            business.stock_history_12m_avg, [700000, 500000, 300000], [3, 2, 1]
        )
        score_breakdown['stock_history'] = stock_score
        total_score += stock_score
        
        # Average Daily Sales (5 points)
        daily_sales_score = self._score_by_thresholds(
            business.average_daily_sales, [35000, 20000, 7000], [5, 3, 2]
        )
        score_breakdown['daily_sales'] = daily_sales_score
        total_score += daily_sales_score
        
        # Last Month Sales (4 points)
        monthly_sales_score = self._score_by_thresholds(
            business.last_month_sales, [1000000, 600000, 300000], [4, 3, 1]
        )
        score_breakdown['monthly_sales'] = monthly_sales_score
        total_score += monthly_sales_score
        
        # Sales History (3 points)
        sales_history_score = self._score_by_thresholds(
            business.sales_history_12m_avg, [1000000, 600000, 300000], [3, 2, 1]
        )
        score_breakdown['sales_history'] = sales_history_score
        total_score += sales_history_score
        
        # Cash on Delivery (2 points)
        cod_score = self._score_by_thresholds(
            business.cash_on_delivery_12m_avg, [200000, 100000], [2, 1]
        )
        score_breakdown['cash_on_delivery'] = cod_score
        total_score += cod_score
        
        # Other Income (3 points)
        other_income_score = self._score_by_thresholds(
            business.other_income_last_month, [100000, 50000, 30000], [3, 2, 1]
        )
        score_breakdown['other_income'] = other_income_score
        total_score += other_income_score
        
        # Expense Ratios
        if business.last_month_sales and business.last_month_sales > 0:
            expense_ratio = (business.total_expense_last_month or 0) / business.last_month_sales * 100
            
            # Total Expense % (3 points)
            if expense_ratio <= 30:
                total_expense_score = 3
            elif expense_ratio <= 40:
                total_expense_score = 2
            elif expense_ratio <= 50:
                total_expense_score = 1
            else:
                total_expense_score = 0
            
            score_breakdown['total_expense_ratio'] = total_expense_score
            total_score += total_expense_score
        
        # Deliveries (2 points)
        deliveries_score = self._score_by_thresholds(
            business.deliveries_last_month, [500, 300], [2, 1]
        )
        score_breakdown['deliveries'] = deliveries_score
        total_score += deliveries_score
        
        return {
            'score': total_score,
            'breakdown': score_breakdown
        }
    
    def _calculate_compliance(self, application: CreditApplication) -> Dict[str, Any]:
        """Calculate Compliance score (20 points)"""
        score_breakdown = {}
        total_score = 0
        
        business = application.business_data
        borrower = application.borrower_info
        financial = application.financial_data
        
        # Personal Expense (2 points)
        if financial.monthly_income and financial.monthly_income > 0:
            personal_expense_ratio = (business.personal_expense or 0) / financial.monthly_income * 100
            if personal_expense_ratio <= 30:
                personal_score = 2
            elif personal_expense_ratio <= 40:
                personal_score = 1
            else:
                personal_score = 0
        else:
            personal_score = 0
        
        score_breakdown['personal_expense'] = personal_score
        total_score += personal_score
        
        # Previous Occupation (1 point)
        # Assuming same business if business years > 2
        prev_occupation_score = 1 if business.years_of_operation >= 2 else 0
        score_breakdown['previous_occupation'] = prev_occupation_score
        total_score += prev_occupation_score
        
        # Residency Status (3 points)
        residency_score = 3 if borrower.residency_status == 'permanent' else 0
        score_breakdown['residency_status'] = residency_score
        total_score += residency_score
        
        # Years of Residency (2 points)
        if borrower.years_of_residency >= 10:
            residency_years_score = 2
        elif borrower.years_of_residency >= 5:
            residency_years_score = 1
        else:
            residency_years_score = 0
        
        score_breakdown['years_of_residency'] = residency_years_score
        total_score += residency_years_score
        
        # Guarantor Category (4 points)
        guarantor_scores = {'strong': 4, 'medium': 2, 'weak': 0}
        guarantor_score = guarantor_scores.get(borrower.guarantor_category, 0)
        score_breakdown['guarantor_category'] = guarantor_score
        total_score += guarantor_score
        
        # Years of Operation (3 points)
        if business.years_of_operation >= 10:
            operation_years_score = 3
        elif business.years_of_operation >= 5:
            operation_years_score = 1
        else:
            operation_years_score = 0
        
        score_breakdown['years_of_operation'] = operation_years_score
        total_score += operation_years_score
        
        # Trade License Age (2 points)
        if business.trade_license_age >= 4:
            license_score = 2
        elif business.trade_license_age >= 2:
            license_score = 1
        else:
            license_score = 0
        
        score_breakdown['trade_license_age'] = license_score
        total_score += license_score
        
        # Rent Deed Period (1 point)
        rent_deed_score = 1 if business.rent_deed_period >= 3 else 0
        score_breakdown['rent_deed_period'] = rent_deed_score
        total_score += rent_deed_score
        
        # Rent Advance (2 points)
        rent_advance_score = 2 if business.rent_advance >= 500000 else 0
        score_breakdown['rent_advance'] = rent_advance_score
        total_score += rent_advance_score
        
        return {
            'score': total_score,
            'max_score': 20,
            'breakdown': score_breakdown
        }
    
    def _score_by_thresholds(self, value: Decimal, thresholds: list, scores: list) -> int:
        """Helper method to score values based on thresholds"""
        if not value:
            return 0
        
        for i, threshold in enumerate(thresholds):
            if value >= threshold:
                return scores[i]
        
        return 0