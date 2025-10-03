"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const assignmentApi = createApi({
  reducerPath: "assignmentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000",
  }),
  tagTypes: ["Assignment"],
  endpoints: (builder) => ({
    // Fetch all assignments
    getAssignments: builder.query<any[], void>({
      query: () => "/assignments",
      providesTags: ["Assignment"],
    }),

    // Create new assignment
    createAssignment: builder.mutation<any, Partial<any>>({
      query: (body) => ({
        url: "/assignments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Assignment"],
    }),

    // Update assignment
    updateAssignment: builder.mutation<any, { id: string; data: Partial<any> }>({
      query: ({ id, data }) => ({
        url: `/assignments/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Assignment"],
    }),

    // Delete assignment
    deleteAssignment: builder.mutation<any, string>({
      query: (id) => ({
        url: `/assignments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Assignment"],
    }),

    // Upload PDFs
    uploadAssignment: builder.mutation<any, { id: string; files: FileList }>({
      query: ({ id, files }) => {
        const form = new FormData();
        for (let i = 0; i < files.length; i++) {
          form.append("files", files[i]);
        }
        return {
          url: `/assignments/${id}/upload`,
          method: "POST",
          body: form,
        };
      },
    }),

    // Download Marks CSV
    downloadCsv: builder.query<any, string>({
      query: (id) => `/assignments/${id}/download`,
    }),
  }),
});

export const {
  useGetAssignmentsQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useUploadAssignmentMutation,
  useDownloadCsvQuery,
} = assignmentApi;
