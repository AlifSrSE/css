from rest_framework import serializers
from .models import (
    CreditApplication, CreditScore, BorrowerInfo, BusinessData, 
    FinancialData, LoanInfo, PsychometricResult
)
from decimal import Decimal

class LoanInfoSerializer(serializers.Serializer):
    """Serializer for existing loan information"""
    fi_name = serializers.CharField(max_length=100)
    fi_type = serializers.ChoiceField(choices=['supplier', 'mfi', 'nbfi', 'bank', 'drutoloan'])
    loan_type = serializers.CharField(max_length=50, required=False, allow_blank=True)
    loan_amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0)
    tenure_years = serializers.IntegerField(min_value=1, max_value=30)
    outstanding_loan = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0)
    monthly_installment = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0)
    overdue_amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0, default=0)
    repayment_status = serializers.ChoiceField(
        choices=['on_time', 'overdue_3_days', 'overdue_7_days', 'default']
    )
    repaid_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=0, max_value=100)

class BorrowerInfoSerializer(serializers.Serializer):
    """Serializer for borrower information"""
    full_name = serializers.CharField(max_length=100)
    phone = serializers.CharField(max_length=15)
    email = serializers.EmailField(required=False, allow_blank=True)
    national_id = serializers.CharField(max_length=20)
    address = serializers.CharField()
    residency_status = serializers.ChoiceField(choices=['permanent', 'temporary'])
    years_of_residency = serializers.IntegerField(min_value=0, required=False, allow_null=True)
    previous_occupation = serializers.CharField(max_length=100, required=False, allow_blank=True)
    guarantor_category = serializers.ChoiceField(
        choices=['strong', 'medium', 'weak'], 
        required=False, 
        allow_null=True
    )

class BusinessDataSerializer(serializers.Serializer):
    """Serializer for business data"""
    business_name = serializers.CharField(max_length=200)
    business_type = serializers.CharField(max_length=100)
    business_category = serializers.IntegerField(min_value=1, max_value=3, required=False, allow_null=True)
    years_of_operation = serializers.IntegerField(min_value=0, required=False, allow_null=True)
    trade_license_age = serializers.IntegerField(min_value=0, required=False, allow_null=True)
    seller_type = serializers.ChoiceField(choices=['wholesaler', 'retailer'], required=False, allow_null=True)
    
    # Sales and Revenue
    average_daily_sales = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0, required=False, allow_null=True
    )
    last_month_sales = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0, required=False, allow_null=True
    )
    sales_history_12m_avg = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0, required=False, allow_null=True
    )
    other_income_last_month = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0, required=False, allow_null=True
    )
    
    # Inventory and Stock
    inventory_value_present = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0, required=False, allow_null=True
    )
    product_purchase_last_month = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0, required=False, allow_null=True
    )
    stock_history_12m_avg = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0, required=False, allow_null=True
    )
    
    # Expenses
    total_expense_last_month = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0, required=False, allow_null=True
    )
    salary_expense_last_month = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0, required=False, allow_null=True
    )
    rent_utility_expense_last_month = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0, required=False, allow_null=True
    )
    expense_history_12m_avg = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0, required=False, allow_null=True
    )
    personal_expense = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0, required=False, allow_null=True
    )
    
    # Operations
    cash_on_delivery_12m_avg = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0, required=False, allow_null=True
    )
    deliveries_last_month = serializers.IntegerField(min_value=0, required=False, allow_null=True)
    rent_advance = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0, required=False, allow_null=True
    )
    rent_deed_period = serializers.IntegerField(min_value=0, required=False, allow_null=True)

class FinancialDataSerializer(serializers.Serializer):
    """Serializer for financial data"""
    bank_transaction_volume_1y = serializers.DecimalField(
        max_digits=15, decimal_places=2, min_value=0, required=False, allow_null=True
    )
    mfs_transaction_volume_monthly = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0, required=False, allow_null=True
    )
    existing_loans = serializers.ListField(
        child=LoanInfoSerializer(), 
        required=False, 
        allow_empty=True
    )
    total_assets = serializers.DecimalField(
        max_digits=15, decimal_places=2, min_value=0, required=False, allow_null=True
    )
    cash_equivalent = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0, required=False, allow_null=True
    )
    monthly_income = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0, required=False, allow_null=True
    )

class CreditApplicationSerializer(serializers.Serializer):
    """Serializer for credit applications"""
    id = serializers.CharField(read_only=True)
    application_id = serializers.CharField(read_only=True)
    
    borrower_info = BorrowerInfoSerializer()
    business_data = BusinessDataSerializer()
    financial_data = FinancialDataSerializer()
    
    status = serializers.ChoiceField(
        choices=['pending', 'processing', 'completed', 'rejected'],
        read_only=True
    )
    loan_amount_requested = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0, required=False, allow_null=True
    )
    loan_purpose = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

class CreditApplicationListSerializer(serializers.Serializer):
    """Serializer for application list view"""
    id = serializers.CharField(read_only=True)
    application_id = serializers.CharField(read_only=True)
    borrower_name = serializers.SerializerMethodField()
    business_name = serializers.SerializerMethodField()
    business_type = serializers.SerializerMethodField()
    loan_amount_requested = serializers.DecimalField(max_digits=12, decimal_places=2)
    status = serializers.CharField()
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()
    
    def get_borrower_name(self, obj):
        return obj.borrower_info.full_name if obj.borrower_info else ""
    
    def get_business_name(self, obj):
        return obj.business_data.business_name if obj.business_data else ""
    
    def get_business_type(self, obj):
        return obj.business_data.business_type if obj.business_data else ""

class PsychometricResultSerializer(serializers.Serializer):
    """Serializer for psychometric test results"""
    question_responses = serializers.DictField()
    time_discipline_score = serializers.IntegerField(min_value=0, max_value=20)
    impulse_planning_score = serializers.IntegerField(min_value=0, max_value=20)
    honesty_responsibility_score = serializers.IntegerField(min_value=0, max_value=20)
    resilience_score = serializers.IntegerField(min_value=0, max_value=20)
    future_orientation_score = serializers.IntegerField(min_value=0, max_value=20)
    total_score = serializers.IntegerField(min_value=0, max_value=100)
    adjustment_points = serializers.IntegerField(min_value=-5, max_value=5)
    test_duration_minutes = serializers.FloatField()

class RatioScoreSerializer(serializers.Serializer):
    """Serializer for individual ratio scores"""
    ratio_name = serializers.CharField()
    ratio_value = serializers.DecimalField(max_digits=10, decimal_places=2)
    score = serializers.IntegerField()
    band = serializers.ChoiceField(choices=['green', 'amber', 'red'])
    threshold_met = serializers.BooleanField()

class RedFlagSerializer(serializers.Serializer):
    """Serializer for red flags"""
    flag_type = serializers.ChoiceField(choices=['hard', 'soft'])
    flag_name = serializers.CharField()
    description = serializers.CharField()
    severity = serializers.ChoiceField(choices=['low', 'medium', 'high', 'critical'])
    impact = serializers.CharField()

class CreditScoreSerializer(serializers.Serializer):
    """Serializer for credit score results"""
    id = serializers.CharField(read_only=True)
    application = serializers.CharField()  # Application ID reference
    
    # Component Scores
    data_points_score = serializers.IntegerField(min_value=0, max_value=100)
    data_points_breakdown = serializers.DictField()
    credit_ratios_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    credit_ratios_breakdown = serializers.ListField(child=RatioScoreSerializer())
    borrower_attributes_score = serializers.IntegerField(min_value=0, max_value=100)
    borrower_attributes_breakdown = serializers.DictField()
    psychometric_result = PsychometricResultSerializer(required=False, allow_null=True)
    
    # Final Results
    total_points = serializers.DecimalField(max_digits=5, decimal_places=2)
    grade = serializers.ChoiceField(choices=['A', 'B', 'C', 'R'])
    loan_slab_adjustment = serializers.CharField()
    risk_level = serializers.ChoiceField(choices=['low', 'medium', 'high', 'very_high'])
    default_probability = serializers.DecimalField(max_digits=5, decimal_places=3)
    
    # Analysis
    red_flags = serializers.ListField(child=RedFlagSerializer())
    recommendations = serializers.ListField(child=serializers.CharField())
    max_loan_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    recommended_interest_rate = serializers.DecimalField(
        max_digits=5, decimal_places=2, required=False, allow_null=True
    )
    recommended_tenure_months = serializers.IntegerField(required=False, allow_null=True)
    
    # AI Predictions (if available)
    ai_predictions = serializers.DictField(required=False, allow_null=True)
    
    # Metadata
    calculated_at = serializers.DateTimeField(read_only=True)
    calculated_by = serializers.CharField(read_only=True)
    version = serializers.CharField(read_only=True)

class ScoreCalculationRequestSerializer(serializers.Serializer):
    """Serializer for score calculation requests"""
    application_id = serializers.CharField()
    psychometric_responses = serializers.DictField(required=False, allow_null=True)
    force_recalculate = serializers.BooleanField(default=False)

class PsychometricQuestionSerializer(serializers.Serializer):
    """Serializer for psychometric questions"""
    id = serializers.CharField()
    dimension = serializers.CharField()
    question = serializers.CharField()
    options = serializers.ListField(child=serializers.DictField())
    max_score = serializers.IntegerField()