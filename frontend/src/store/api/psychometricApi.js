import { baseApi } from './baseApi';
export const psychometricApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getQuestions: builder.query({
            query: () => 'psychometric/questions/',
            providesTags: ['PsychometricTest'],
        }),
        startTestSession: builder.mutation({
            query: (data) => ({
                url: 'psychometric/start-session/',
                method: 'POST',
                body: data,
            }),
        }),
        saveResponse: builder.mutation({
            query: (data) => ({
                url: 'psychometric/save-response/',
                method: 'POST',
                body: data,
            }),
        }),
        completeTest: builder.mutation({
            query: (data) => ({
                url: 'psychometric/complete-test/',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['PsychometricTest'],
        }),
        validateResponses: builder.mutation({
            query: (data) => ({
                url: 'psychometric/validate/',
                method: 'POST',
                body: data,
            }),
        }),
    }),
});
export const { useGetQuestionsQuery, useStartTestSessionMutation, useSaveResponseMutation, useCompleteTestMutation, useValidateResponsesMutation, } = psychometricApi;
