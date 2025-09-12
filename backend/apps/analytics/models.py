from mongoengine import Document, fields
from datetime import datetime

class AnalyticsMetric(Document):
    """Store analytics metrics"""
    metric_name = fields.StringField(required=True)
    metric_type = fields.StringField(
        choices=['count', 'sum', 'average', 'percentage', 'ratio'],
        required=True
    )
    value = fields.FloatField(required=True)
    dimensions = fields.DictField()  # Additional dimensions like business_type, risk_level, etc.
    date_recorded = fields.DateTimeField(default=datetime.utcnow)
    period_type = fields.StringField(
        choices=['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
        default='daily'
    )
    period_start = fields.DateTimeField(required=True)
    period_end = fields.DateTimeField(required=True)
    
    meta = {
        'collection': 'analytics_metrics',
        'indexes': [
            'metric_name',
            'metric_type',
            'period_type',
            ('metric_name', 'period_start'),
            ('date_recorded', -1)
        ]
    }

class ModelPerformanceMetric(Document):
    """Store model performance metrics"""
    model_version = fields.StringField(required=True)
    metric_type = fields.StringField(
        choices=['accuracy', 'precision', 'recall', 'f1_score', 'auc_roc', 'false_positive_rate', 'false_negative_rate'],
        required=True
    )
    value = fields.FloatField(required=True)
    grade = fields.StringField(required=False)  # For grade-specific metrics
    sample_size = fields.IntField(required=True)
    evaluation_date = fields.DateTimeField(default=datetime.utcnow)
    notes = fields.StringField()
    
    meta = {
        'collection': 'model_performance_metrics',
        'indexes': ['model_version', 'metric_type', 'evaluation_date']
    }
