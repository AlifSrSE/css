from rest_framework import serializers

class ReportGenerationRequestSerializer(serializers.Serializer):
    """Serializer for report generation requests"""
    report_type = serializers.ChoiceField(
        choices=['score_breakdown', 'risk_assessment', 'comparative_analysis', 'portfolio_summary']
    )
    application_ids = serializers.ListField(
        child=serializers.CharField(),
        min_length=1,
        max_length=100
    )
    format = serializers.ChoiceField(
        choices=['pdf', 'excel', 'html', 'json'],
        default='pdf'
    )
    include_charts = serializers.BooleanField(default=True)
    include_recommendations = serializers.BooleanField(default=True)
    template_id = serializers.CharField(required=False, allow_blank=True)

class ScoreBreakdownReportSerializer(serializers.Serializer):
    """Serializer for score breakdown report data"""
    application_id = serializers.CharField()
    borrower_name = serializers.CharField()
    business_name = serializers.CharField()
    final_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    grade = serializers.CharField()
    
    component_scores = serializers.DictField()
    risk_assessment = serializers.DictField()
    recommendations = serializers.ListField(child=serializers.CharField())
    red_flags = serializers.ListField(child=serializers.DictField())
    
    generated_at = serializers.DateTimeField()

class ReportListSerializer(serializers.Serializer):
    """Serializer for report list"""
    id = serializers.CharField()
    report_id = serializers.CharField()
    report_type = serializers.CharField()
    format = serializers.CharField()
    status = serializers.CharField()
    generated_at = serializers.DateTimeField()
    expires_at = serializers.DateTimeField()
    file_size = serializers.IntegerField()
    download_url = serializers.CharField()
