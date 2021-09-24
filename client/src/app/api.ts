import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const api = createApi({
    reducerPath: 'api',
    tagTypes: ['Files'],
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000' }),
    endpoints: (builder) => ({

        getFiles: builder.query<File[], void>({
            query: () => `/`,
            providesTags: ['Files'],
        }),

        uploadFile: builder.mutation<void, FormData>({
            query: (input) => ({ url: `/`, method: 'POST', body: input }),
            invalidatesTags: ['Files'],
        }),

        deleteFile: builder.mutation<void, string>({
            query: (key) => ({ url: `/${key}`, method: 'DELETE' }),
            invalidatesTags: ['Files'],
        }),

    }),
})


export const { useGetFilesQuery, useDeleteFileMutation, useUploadFileMutation } = api
