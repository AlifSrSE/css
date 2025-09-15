import { baseApi } from './baseApi';
export const analyticsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAnalytics: builder.query({
            query: (params) => {
                const searchParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    if (value)
                        searchParams.append(key, value);
                });
                return `analytics/dashboard/?${searchParams}`;
            },
            providesTags: ['Dashboard'],
        }),
        getPerformanceMetrics: builder.query({
            query: ({ period = '6m' }) => `analytics/performance/?period=${period}`,
            providesTags: ['Dashboard'],
        }),
        getBusinessInsights: builder.query({
            query: () => 'analytics/business-insights/',
            providesTags: ['Dashboard'],
        }),
    }),
});
export const { useGetAnalyticsQuery, useGetPerformanceMetricsQuery, useGetBusinessInsightsQuery, } = analyticsApi;
