from django.urls import path
from .views import DashboardAnalyticsView, PerformanceMetricsView, BusinessInsightsView

urlpatterns = [
    path('dashboard/', DashboardAnalyticsView.as_view(), name='dashboard_analytics'),
    path('performance/', PerformanceMetricsView.as_view(), name='performance_metrics'),
    path('business-insights/', BusinessInsightsView.as_view(), name='business_insights'),
]