import { baseApi } from './baseApi';
import type {
  PsychometricQuestion,
  PsychometricTestSession,
  PsychometricResult,
  ApiResponse,
} from '../../types/scoring';

export const psychometricApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuestions: builder.query<PsychometricQuestion[], void>({
      query: () => 'psychometric/questions/',
      providesTags: ['PsychometricTest'],
    }),

    startTestSession: builder.mutation<
      PsychometricTestSession,
      { application_id: string }
    >({
      query: (data) => ({
        url: 'psychometric/start-session/',
        method: 'POST',
        body: data,
      }),
    }),

    saveResponse: builder.mutation<
      ApiResponse<void>,
      {
        session_id: string;
        question_id: string;
        selected_option: number;
      }
    >({
      query: (data) => ({
        url: 'psychometric/save-response/',
        method: 'POST',
        body: data,
      }),
    }),

    completeTest: builder.mutation<
      PsychometricResult,
      { session_id: string }
    >({
      query: (data) => ({
        url: 'psychometric/complete-test/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PsychometricTest'],
    }),

    validateResponses: builder.mutation<
      ApiResponse<{ is_valid: boolean; errors: string[]; warnings: string[] }>,
      { responses: Record<string, any> }
    >({
      query: (data) => ({
        url: 'psychometric/validate/',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetQuestionsQuery,
  useStartTestSessionMutation,
  useSaveResponseMutation,
  useCompleteTestMutation,
  useValidateResponsesMutation,
} = psychometricApi;