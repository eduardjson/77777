import { createApi } from "@reduxjs/toolkit/query/react";

const API_URL = "http://localhost:5000/api";

export interface ProjectImage {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  sortOrder: number;
}

export interface ProjectDocument {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface EstimateItem {
  id?: string;
  productId?: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
  costType: "MATERIAL" | "LABOR";
}

export interface Estimate {
  id?: string;
  laborCost?: number;
  materialsCost?: number;
  totalCost: number;
  items: EstimateItem[];
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  images: ProjectImage[];
  documents: ProjectDocument[];
  estimate?: Estimate;
  _count?: {
    images: number;
    documents: number;
  };
}

import { customFetchBaseQuery } from "../utils";

// API Slice
export const projectApi = createApi({
  reducerPath: "project",
  baseQuery: customFetchBaseQuery,
  tagTypes: ["Project", "Projects", "Image", "Document"],
  endpoints: builder => ({
    getProjects: builder.query<Project[], void>({
      query: () => "/projects",
      providesTags: result =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Project" as const, id })),
              { type: "Projects", id: "LIST" },
            ]
          : [{ type: "Projects", id: "LIST" }],
    }),

    getProject: builder.query<Project, string>({
      query: id => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: "Project", id }],
    }),

    createProject: builder.mutation<Project, FormData>({
      query: formData => ({
        url: "/projects",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "Projects", id: "LIST" }],
    }),

    updateProject: builder.mutation<
      Project,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/projects/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Project", id },
        { type: "Projects", id: "LIST" },
      ],
    }),

    deleteProject: builder.mutation<{ message: string }, string>({
      query: id => ({
        url: `/projects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Project", id },
        { type: "Projects", id: "LIST" },
      ],
    }),

    deleteImage: builder.mutation<{ message: string }, string>({
      query: id => ({
        url: `/projects/images/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Projects", id: "LIST" }],
    }),

    deleteDocument: builder.mutation<{ message: string }, string>({
      query: id => ({
        url: `/projects/documents/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Projects", id: "LIST" }],
    }),

    // НОВЫЙ МЕТОД: получение изображения как blob
    getImageBlob: builder.query<Blob, string>({
      query: id => ({
        url: `/projects/images/${id}/blob`,
        responseHandler: async response => {
          if (!response.ok) {
            throw new Error("Failed to fetch image");
          }
          return await response.blob();
        },
      }),
      providesTags: (result, error, id) => [{ type: "Image", id }],
    }),

    // НОВЫЙ МЕТОД: получение документа как blob
    getDocumentBlob: builder.query<Blob, string>({
      query: id => ({
        url: `/projects/documents/${id}/blob`,
        responseHandler: async response => {
          if (!response.ok) {
            throw new Error("Failed to fetch document");
          }
          return await response.blob();
        },
      }),
      providesTags: (result, error, id) => [{ type: "Document", id }],
    }),

    // НОВЫЕ МЕТОДЫ: ленивые версии для загрузки по требованию
    getImageBlobLazy: builder.query<Blob, string>({
      query: id => ({
        url: `/projects/images/${id}/blob`,
        responseHandler: async response => {
          if (!response.ok) {
            throw new Error("Failed to fetch image");
          }
          return await response.blob();
        },
      }),
      providesTags: (result, error, id) => [{ type: "Image", id }],
    }),

    getDocumentBlobLazy: builder.query<Blob, string>({
      query: id => ({
        url: `/projects/documents/${id}/blob`,
        responseHandler: async response => {
          if (!response.ok) {
            throw new Error("Failed to fetch document");
          }
          return await response.blob();
        },
      }),
      providesTags: (result, error, id) => [{ type: "Document", id }],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useDeleteImageMutation,
  useDeleteDocumentMutation,
  useGetImageBlobQuery,
  useGetDocumentBlobQuery,
  useLazyGetImageBlobQuery,
  useLazyGetDocumentBlobQuery,
} = projectApi;

// Старые методы для прямых ссылок (можно оставить или удалить)
export const getImageUrl = (id: string) => `${API_URL}/projects/images/${id}`;
export const getDocumentUrl = (id: string) =>
  `${API_URL}/projects/documents/${id}`;
