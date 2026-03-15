import { createApi } from "@reduxjs/toolkit/query/react";
import { customFetchBaseQuery } from "../utils";

export const fileApi = createApi({
  reducerPath: "file",
  baseQuery: customFetchBaseQuery,
  endpoints: builder => ({
    downloadFile: builder.query<Blob, { id: string; fileName: string }>({
      query: ({ id }) => ({
        url: `/attachments/${id}`,
        responseHandler: response => response.blob(),
      }),
    }),
  }),
});

export const { useLazyDownloadFileQuery } = fileApi;
