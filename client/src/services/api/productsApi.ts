import { CreateProductDTO, ProductDTO, UpdateProductDTO } from "../../dto";
import { createApi } from "@reduxjs/toolkit/query/react";
import { customFetchBaseQuery } from "../utils";

export const productApi = createApi({
  reducerPath: "product",
  baseQuery: customFetchBaseQuery,
  tagTypes: ["Product"],
  endpoints: builder => ({
    getAllProducts: builder.query<ProductDTO[], void>({
      query: () => "/products",
      providesTags: ["Product"],
    }),
    getProductById: builder.query<ProductDTO, string>({
      query: id => `/products/${id}`,
      providesTags: result =>
        result ? [{ type: "Product", id: result.id }] : [],
    }),
    createProduct: builder.mutation<
      ProductDTO,
      { data: CreateProductDTO | UpdateProductDTO; id: string }
    >({
      query: ({ data }) => ({
        url: "/products",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation<
      UpdateProductDTO,
      { data: CreateProductDTO | UpdateProductDTO; id: string }
    >({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: "Product", id }],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: id => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: () => ["Product"],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
