from django.urls import path
from .views import (
    ApplicationListCreateView, ApplicationDetailView, ScoreCalculationView,
    ScoreResultsView, PsychometricQuestionsView, BulkScoreCalculationView,
    DashboardStatsView
)

urlpatterns = [
    path('applications/', ApplicationListCreateView.as_view(), name='application_list_create'),
    path('applications/<str:application_id>/', ApplicationDetailView.as_view(), name='application_detail'),
    path('calculate/', ScoreCalculationView.as_view(), name='score_calculate'),
    path('results/<str:application_id>/', ScoreResultsView.as_view(), name='score_results'),
    path('psychometric/questions/', PsychometricQuestionsView.as_view(), name='psychometric_questions'),
    path('bulk-calculate/', BulkScoreCalculationView.as_view(), name='bulk_calculate'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
]