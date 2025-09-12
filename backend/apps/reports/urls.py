from django.urls import path
from .views import (
    ReportGenerationView, ReportListView, ReportDownloadView,
    ScoreBreakdownView, RiskAssessmentView
)

urlpatterns = [
    path('generate/', ReportGenerationView.as_view(), name='report_generate'),
    path('', ReportListView.as_view(), name='report_list'),
    path('download/<str:report_id>/', ReportDownloadView.as_view(), name='report_download'),
    path('score-breakdown/<str:application_id>/', ScoreBreakdownView.as_view(), name='score_breakdown'),
    path('risk-assessment/<str:application_id>/', RiskAssessmentView.as_view(), name='risk_assessment'),
]