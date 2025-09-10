# apps/credit_scoring/models.py
from mongoengine import Document, EmbeddedDocument, fields
from datetime import datetime
from enum import Enum

class BusinessType(Enum):
    HIGH = 3
    MEDIUM = 2
    LOW = 1
    RED_FLAG = 0

class FIType(Enum):
    SUPPLIER = 5
    MFI = 6
    NBFI = 8
    BANK = 9
    DRUTOLOAN = 10

class ApplicationStatus(Enum):
    PENDING = 'pending'
    PROCESSING = 'processing'
    COMPLETED = 'completed'
    REJECTED = 'rejected'

class Grade(Enum):
    A = 'A'
    B = 'B'
    C = 'C'
    R = 'R'

# Embedded Documents
class BorrowerInfo(EmbeddedDocument):
    full_name = fields.StringField(required=True, max_length=100)
    phone = fields.StringField(required=True, max_length=15)
    email = fields.EmailField()
    national_id = fields.StringField(required=True, max_length=20)
    address = fields.StringField(required=True)
    residency_status = fields.StringField(choices=['permanent', 'temporary'], required=True)
    years_of_residency = fields.IntField(min_value=0)
    previous_occupation = fields.StringField()
    guarantor_category = fields.StringField(choices=['strong', 'medium', 'weak'])

class BusinessData(EmbeddedDocument):
    business_name = fields.StringField(required=True)
    business_type = fields.StringField(required=True)
    business_category = fields.IntField(choices=[1, 2, 3])  # Low, Medium, High
    years_of_operation = fields.IntField(min_value=0)
    trade_license_age = fields.IntField(min_value=0)
    seller_type = fields.StringField(choices=['wholesaler', 'retailer'])
    
    # Sales and Revenue
    average_daily_sales = fields.DecimalField(min_value=0)
    last_month_sales = fields.DecimalField(min_value=0)
    sales_history_12m_avg = fields.DecimalField(min_value=0)
    other_income_last_month = fields.DecimalField(min_value=0)
    
    # Inventory and Stock
    inventory_value_present = fields.DecimalField(min_value=0)
    product_purchase_last_month = fields.DecimalField(min_value=0)
    stock_history_12m_avg = fields.DecimalField(min_value=0)
    
    # Expenses
    total_expense_last_month = fields.DecimalField(min_value=0)
    salary_expense_last_month = fields.DecimalField(min_value=0)
    rent_utility_expense_last_month = fields.DecimalField(min_value=0)
    expense_history_12m_avg = fields.DecimalField(min_value=0)
    personal_expense = fields.DecimalField(min_value=0)
    
    # Operations
    cash_on_delivery_12m_avg = fields.DecimalField(min_value=0)
    deliveries_last_month = fields.IntField(min_value=0)
    rent_advance = fields.DecimalField(min_value=0)
    rent_deed_period = fields.IntField(min_value=0)

class FinancialData(EmbeddedDocument):
    # Bank and MFS Data
    bank_transaction_volume_1y = fields.DecimalField(min_value=0)
    mfs_transaction_volume_monthly = fields.DecimalField(min_value=0)
    
    # Existing Loans
    existing_loans = fields.ListField(fields.EmbeddedDocumentField('LoanInfo'))
    
    # Assets
    total_assets = fields.DecimalField(min_value=0)
    cash_equivalent = fields.DecimalField(min_value=0)
    
    # Income
    monthly_income = fields.DecimalField(min_value=0)

class LoanInfo(EmbeddedDocument):
    fi_name = fields.StringField(required=True)
    fi_type = fields.StringField(choices=['supplier', 'mfi', 'nbfi', 'bank', 'drutoloan'])
    loan_type = fields.StringField()
    loan_amount = fields.DecimalField(min_value=0)
    tenure_years = fields.IntField(min_value=0)
    outstanding_loan = fields.DecimalField(min_value=0)
    monthly_installment = fields.DecimalField(min_value=0)
    overdue_amount = fields.DecimalField(min_value=0, default=0)
    repayment_status = fields.StringField(choices=['on_time', 'overdue_3_days', 'overdue_7_days', 'default'])
    repaid_percentage = fields.DecimalField(min_value=0, max_value=100)

class RatioScore(EmbeddedDocument):
    ratio_name = fields.StringField(required=True)
    ratio_value = fields.DecimalField()
    score = fields.IntField(min_value=0)
    band = fields.StringField(choices=['green', 'amber', 'red'])
    threshold_met = fields.BooleanField()

class RedFlag(EmbeddedDocument):
    flag_type = fields.StringField(choices=['hard', 'soft'], required=True)
    flag_name = fields.StringField(required=True)
    description = fields.StringField(required=True)
    severity = fields.StringField(choices=['low', 'medium', 'high', 'critical'])
    impact = fields.StringField()

class PsychometricResult(EmbeddedDocument):
    question_responses = fields.DictField()
    time_discipline_score = fields.IntField(min_value=0, max_value=20)
    impulse_planning_score = fields.IntField(min_value=0, max_value=20)
    honesty_responsibility_score = fields.IntField(min_value=0, max_value=20)
    resilience_score = fields.IntField(min_value=0, max_value=20)
    future_orientation_score = fields.IntField(min_value=0, max_value=20)
    total_score = fields.IntField(min_value=0, max_value=100)
    adjustment_points = fields.IntField(min_value=-5, max_value=5)
    test_duration_minutes = fields.FloatField()

# Main Documents
class CreditApplication(Document):
    application_id = fields.StringField(required=True, unique=True)
    borrower_info = fields.EmbeddedDocumentField(BorrowerInfo, required=True)
    business_data = fields.EmbeddedDocumentField(BusinessData, required=True)
    financial_data = fields.EmbeddedDocumentField(FinancialData, required=True)
    
    # Application metadata
    status = fields.StringField(choices=[s.value for s in ApplicationStatus], 
                               default=ApplicationStatus.PENDING.value)
    submitted_by = fields.StringField()  # User ID or system identifier
    loan_amount_requested = fields.DecimalField(min_value=0)
    loan_purpose = fields.StringField()
    
    # Timestamps
    created_at = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'credit_applications',
        'indexes': ['application_id', 'status', 'created_at']
    }

class CreditScore(Document):
    application = fields.ReferenceField(CreditApplication, required=True)
    
    # Component Scores
    data_points_score = fields.IntField(min_value=0, max_value=100)
    data_points_breakdown = fields.DictField()
    
    credit_ratios_score = fields.DecimalField(min_value=0)
    credit_ratios_breakdown = fields.ListField(fields.EmbeddedDocumentField(RatioScore))
    
    borrower_attributes_score = fields.IntField(min_value=0, max_value=100)
    borrower_attributes_breakdown = fields.DictField()
    
    psychometric_result = fields.EmbeddedDocumentField(PsychometricResult)
    
    # Final Results
    total_points = fields.DecimalField(min_value=0, max_value=100)
    grade = fields.StringField(choices=[g.value for g in Grade])
    loan_slab_adjustment = fields.StringField()
    
    # Risk Assessment
    risk_level = fields.StringField(choices=['low', 'medium', 'high', 'very_high'])
    default_probability = fields.DecimalField(min_value=0, max_value=1)
    
    # Flags and Recommendations
    red_flags = fields.ListField(fields.EmbeddedDocumentField(RedFlag))
    recommendations = fields.ListField(fields.StringField())
    
    # Loan Calculation Results
    max_loan_amount = fields.DecimalField(min_value=0)
    recommended_interest_rate = fields.DecimalField(min_value=0, max_value=50)
    recommended_tenure_months = fields.IntField(min_value=1)
    
    # AI Predictions (if available)
    ai_predictions = fields.DictField()
    
    # Metadata
    calculated_at = fields.DateTimeField(default=datetime.utcnow)
    calculated_by = fields.StringField()  # System or user identifier
    version = fields.StringField(default='1.0')
    
    meta = {
        'collection': 'credit_scores',
        'indexes': ['application', 'grade', 'calculated_at']
    }

class ScoringAuditLog(Document):
    application = fields.ReferenceField(CreditApplication, required=True)
    action = fields.StringField(required=True)  # 'score_calculated', 'grade_assigned', etc.
    details = fields.DictField()
    old_values = fields.DictField()
    new_values = fields.DictField()
    performed_by = fields.StringField()
    timestamp = fields.DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'scoring_audit_logs',
        'indexes': ['application', 'timestamp']
    }

class SystemConfiguration(Document):
    config_key = fields.StringField(required=True, unique=True)
    config_value = fields.DynamicField()
    description = fields.StringField()
    updated_by = fields.StringField()
    updated_at = fields.DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'system_configurations'
    }

# User Management
class User(Document):
    username = fields.StringField(required=True, unique=True)
    email = fields.EmailField(required=True, unique=True)
    password_hash = fields.StringField(required=True)
    first_name = fields.StringField(max_length=50)
    last_name = fields.StringField(max_length=50)
    role = fields.StringField(choices=['admin', 'analyst', 'viewer'], default='viewer')
    is_active = fields.BooleanField(default=True)
    last_login = fields.DateTimeField()
    created_at = fields.DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'users',
        'indexes': ['username', 'email']
    }

# Report Templates
class ReportTemplate(Document):
    template_name = fields.StringField(required=True)
    template_type = fields.StringField(choices=['score_breakdown', 'risk_assessment', 'comparison'])
    template_config = fields.DictField()
    is_active = fields.BooleanField(default=True)
    created_by = fields.StringField()
    created_at = fields.DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'report_templates'
    }