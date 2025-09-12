import { baseApi } from './baseApi';
import type {
  CreditApplication,
  CreditScore,
  ApplicationFormData,
  ApplicationFilters,
  PaginatedResponse,
  ApiResponse,
  DashboardStats,
} from '../../types/scoring';

export const scoringApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Applications
    getApplications: builder.query<
      PaginatedResponse<CreditApplication>,
      { page?: number; filters?: ApplicationFilters }
    >({
      query: ({ page = 1, filters = {} }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          ...Object.entries(filters).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== '') {
              acc[key] = value.toString();
            }
            return acc;
          }, {} as Record<string, string>),
        });
        return `scoring/applications/?${params}`;
      },
      providesTags: ['Application'],
    }),

    getApplication: builder.query<CreditApplication, string>({
      query: (id) => `scoring/applications/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Application', id }],
    }),

    createApplication: builder.mutation<CreditApplication, ApplicationFormData>({
      query: (data) => ({
        url: 'scoring/applications/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Application'],
    }),

    updateApplication: builder.mutation<
      CreditApplication,
      { id: string; data: Partial<ApplicationFormData> }
    >({
      query: ({ id, data }) => ({
        url: `scoring/applications/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Application', id }],
    }),

    deleteApplication: builder.mutation<void, string>({
      query: (id) => ({
        url: `scoring/applications/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Application'],
    }),

    // Credit Scoring
    calculateScore: builder.mutation<
      CreditScore,
      { application_id: string; psychometric_responses?: Record<string, any> }
    >({
      query: (data) => ({
        url: 'scoring/calculate/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CreditScore', 'Application'],
    }),

    getScore: builder.query<CreditScore, string>({
      query: (application_id) => `scoring/results/${application_id}/`,
      providesTags: (result, error, application_id) => [
        { type: 'CreditScore', id: application_id },
      ],
    }),

    recalculateScore: builder.mutation<
      CreditScore,
      { score_id: string; updates?: Record<string, any> }
    >({
      query: ({ score_id, updates }) => ({
        url: `scoring/recalculate/${score_id}/`,
        method: 'POST',
        body: updates || {},
      }),
      invalidatesTags: ['CreditScore'],
    }),

    // Bulk operations
    bulkCalculateScores: builder.mutation<
      ApiResponse<{ processed: number; successful: number; failed: number }>,
      { application_ids: string[] }
    >({
      query: (data) => ({
        url: 'scoring/bulk-calculate/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CreditScore', 'Application'],
    }),

    // Dashboard
    getDashboardStats: builder.query<DashboardStats, { date_range?: string }>({
      query: ({ date_range } = {}) => {
        const params = date_range ? `?date_range=${date_range}` : '';
        return `dashboard/stats/${params}`;
      },
      providesTags: ['Dashboard'],
    }),

    // Export
    exportApplications: builder.query<
      Blob,
      { filters?: ApplicationFilters; format: 'csv' | 'xlsx' }
    >({
      query: ({ filters = {}, format }) => {
        const params = new URLSearchParams({
          format,
          ...Object.entries(filters).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== '') {
              acc[key] = value.toString();
            }
            return acc;
          }, {} as Record<string, string>),
        });
        return {
          url: `scoring/export/?${params}`,
          responseHandler: (response) => response.blob(),
        };
      },
    }),
  }),
});

export const {
  useGetApplicationsQuery,
  useGetApplicationQuery,
  useCreateApplicationMutation,
  useUpdateApplicationMutation,
  useDeleteApplicationMutation,
  useCalculateScoreMutation,
  useGetScoreQuery,
  useRecalculateScoreMutation,
  useBulkCalculateScoresMutation,
  useGetDashboardStatsQuery,
  useLazyExportApplicationsQuery,
} = scoringApi;
