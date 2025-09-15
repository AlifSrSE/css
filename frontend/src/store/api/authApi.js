import { baseApi } from './baseApi';
export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: 'auth/login/',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['User'],
        }),
        logout: builder.mutation({
            query: () => ({
                url: 'auth/logout/',
                method: 'POST',
            }),
            invalidatesTags: ['User'],
        }),
        getProfile: builder.query({
            query: () => 'auth/profile/',
            providesTags: ['User'],
        }),
        refreshToken: builder.mutation({
            query: (data) => ({
                url: 'auth/refresh/',
                method: 'POST',
                body: data,
            }),
        }),
    }),
});
export const { useLoginMutation, useLogoutMutation, useGetProfileQuery, useRefreshTokenMutation, } = authApi;
