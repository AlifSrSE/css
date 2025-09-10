// src/store/api/analyticsApi.ts
import { baseApi } from './baseApi';

interface AnalyticsData {
  score_trends: Array<{ date: string; avg_score: number; count: number }>;
  grade_distribution: Record<string, number>;
  risk_distribution: Record<string, number>;
  approval_rates: Array<{ month: string; rate: number }>;
  top_red_flags: Array<{ flag: string; count: number; percentage: number }>;
}

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnalytics: builder.query<
      AnalyticsData,
      {
        date_from?: string;
        date_to?: string;
        business_type?: string;
        grade?: string;
      }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.append(key, value);
        });
        return `analytics/dashboard/?${searchParams}`;
      },
      providesTags: ['Dashboard'],
    }),

    getPerformanceMetrics: builder.query<
      {
        model_accuracy: number;
        precision_by_grade: Record<string, number>;
        recall_by_grade: Record<string, number>;
        false_positive_rate: number;
        false_negative_rate: number;
      },
      { period?: string }
    >({
      query: ({ period = '6m' }) => `analytics/performance/?period=${period}`,
      providesTags: ['Dashboard'],
    }),

    getBusinessInsights: builder.query<
      {
        high_performing_sectors: string[];
        risk_concentrations: Record<string, number>;
        seasonal_patterns: Array<{ month: string; trend: string }>;
        recommendations: string[];
      },
      void
    >({
      query: () => 'analytics/business-insights/',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetAnalyticsQuery,
  useGetPerformanceMetricsQuery,
  useGetBusinessInsightsQuery,
} = analyticsApi;