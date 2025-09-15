import { baseApi } from './baseApi';
export const reportsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        generateReport: builder.mutation({
            query: (data) => ({
                url: 'reports/generate/',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Report'],
        }),
        getScoreBreakdown: builder.query({
            query: (application_id) => `reports/score-breakdown/${application_id}/`,
            providesTags: (result, error, application_id) => [
                { type: 'Report', id: application_id },
            ],
        }),
        getRiskAssessment: builder.query({
            query: (application_id) => `reports/risk-assessment/${application_id}/`,
            providesTags: (result, error, application_id) => [
                { type: 'Report', id: application_id },
            ],
        }),
        getComparativeAnalysis: builder.query({
            query: ({ application_id, comparison_group }) => {
                const params = comparison_group ? `?group=${comparison_group}` : '';
                return `reports/comparative/${application_id}/${params}`;
            },
            providesTags: (result, error, { application_id }) => [
                { type: 'Report', id: application_id },
            ],
        }),
        downloadReport: builder.query({
            query: ({ report_id }) => ({
                url: `reports/download/${report_id}/`,
                responseHandler: (response) => response.blob(),
            }),
        }),
        getReportHistory: builder.query({
            query: ({ page = 1 }) => `reports/history/?page=${page}`,
            providesTags: ['Report'],
        }),
    }),
});
export const { useGenerateReportMutation, useGetScoreBreakdownQuery, useGetRiskAssessmentQuery, useGetComparativeAnalysisQuery, useLazyDownloadReportQuery, useGetReportHistoryQuery, } = reportsApi;
