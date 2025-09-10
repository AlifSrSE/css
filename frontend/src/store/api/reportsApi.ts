// src/store/api/reportsApi.ts
import { baseApi } from './baseApi';
import type { ScoreBreakdownReport, ApiResponse } from '../../types/scoring';

interface ReportGenerationRequest {
  report_type: 'score_breakdown' | 'risk_assessment' | 'comparative_analysis';
  application_ids: string[];
  format: 'pdf' | 'html' | 'json';
  include_charts?: boolean;
  include_recommendations?: boolean;
}

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    generateReport: builder.mutation<
      ApiResponse<{ report_id: string; download_url: string }>,
      ReportGenerationRequest
    >({
      query: (data) => ({
        url: 'reports/generate/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Report'],
    }),

    getScoreBreakdown: builder.query<ScoreBreakdownReport, string>({
      query: (application_id) => `reports/score-breakdown/${application_id}/`,
      providesTags: (result, error, application_id) => [
        { type: 'Report', id: application_id },
      ],
    }),

    getRiskAssessment: builder.query<
      ApiResponse<{
        risk_factors: string[];
        mitigation_strategies: string[];
        monitoring_recommendations: string[];
      }>,
      string
    >({
      query: (application_id) => `reports/risk-assessment/${application_id}/`,
      providesTags: (result, error, application_id) => [
        { type: 'Report', id: application_id },
      ],
    }),

    getComparativeAnalysis: builder.query<
      ApiResponse<{
        peer_comparison: Record<string, number>;
        industry_benchmarks: Record<string, number>;
        percentile_ranking: number;
      }>,
      { application_id: string; comparison_group?: string }
    >({
      query: ({ application_id, comparison_group }) => {
        const params = comparison_group ? `?group=${comparison_group}` : '';
        return `reports/comparative/${application_id}/${params}`;
      },
      providesTags: (result, error, { application_id }) => [
        { type: 'Report', id: application_id },
      ],
    }),

    downloadReport: builder.query<
      Blob,
      { report_id: string }
    >({
      query: ({ report_id }) => ({
        url: `reports/download/${report_id}/`,
        responseHandler: (response) => response.blob(),
      }),
    }),

    getReportHistory: builder.query<
      ApiResponse<Array<{
        id: string;
        report_type: string;
        created_at: string;
        status: string;
        download_url?: string;
      }>>,
      { page?: number }
    >({
      query: ({ page = 1 }) => `reports/history/?page=${page}`,
      providesTags: ['Report'],
    }),
  }),
});

export const {
  useGenerateReportMutation,
  useGetScoreBreakdownQuery,
  useGetRiskAssessmentQuery,
  useGetComparativeAnalysisQuery,
  useLazyDownloadReportQuery,
  useGetReportHistoryQuery,
} = reportsApi;