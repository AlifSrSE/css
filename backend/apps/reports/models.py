from mongoengine import Document, fields
from datetime import datetime

class ReportTemplate(Document):
    """Report template model"""
    template_name = fields.StringField(required=True, max_length=100)
    template_type = fields.StringField(
        choices=['score_breakdown', 'risk_assessment', 'comparative_analysis', 'portfolio_summary'],
        required=True
    )
    template_config = fields.DictField(default=dict)
    is_active = fields.BooleanField(default=True)
    created_by = fields.StringField()
    created_at = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'report_templates',
        'indexes': ['template_type', 'is_active']
    }

class GeneratedReport(Document):
    """Generated report model"""
    report_id = fields.StringField(required=True, unique=True)
    report_type = fields.StringField(
        choices=['score_breakdown', 'risk_assessment', 'comparative_analysis', 'portfolio_summary'],
        required=True
    )
    application_ids = fields.ListField(fields.StringField())
    format = fields.StringField(choices=['pdf', 'excel', 'html', 'json'], default='pdf')
    
    # Report content and metadata
    report_data = fields.DictField()
    file_path = fields.StringField()  # Path to generated file
    download_url = fields.StringField()
    
    # Generation details
    requested_by = fields.StringField()
    generated_at = fields.DateTimeField(default=datetime.utcnow)
    generation_duration = fields.FloatField()  # Seconds
    file_size = fields.IntField()  # Bytes
    
    # Status and expiry
    status = fields.StringField(
        choices=['pending', 'generating', 'completed', 'failed', 'expired'],
        default='pending'
    )
    expires_at = fields.DateTimeField()
    error_message = fields.StringField()
    
    meta = {
        'collection': 'generated_reports',
        'indexes': ['report_id', 'status', 'requested_by', 'generated_at']
    }
