import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Warehouse,
  Object as ObjectType,
  StockItem,
  Shipment,
  CreateWarehouseDto,
  CreateObjectDto,
  AddStockDto,
  CreateShipmentDto,
  UpdateShipmentStatusDto,
} from "../../types";

// Добавляем типы для прайс-листа
export interface PriceListItem {
  productId: string;
  productName: string;
  manufacturer: string;
  category: string;
  unit: string;
  purchasePrice?: number;
  estimatePrice?: number;
  salePrice?: number;
  discount?: number;
  quantity: number;
  warehouseId: string;
  warehouseName: string;
  warehouseAddress?: string;
  lastUpdated: string;
  firstArrivalDate: string;
}

export interface PriceListResponse {
  items: PriceListItem[];
  totalItems: number;
  generatedAt: string;
}

export const warehouseApi = createApi({
  reducerPath: "warehouse",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    prepareHeaders: headers => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.set("authorization", `${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Warehouse", "Object", "Shipment", "Stock"],
  endpoints: builder => ({
    getWarehouses: builder.query<Warehouse[], void>({
      query: () => "/warehouses",
      providesTags: ["Warehouse"],
    }),

    getWarehouse: builder.query<Warehouse, string>({
      query: id => `/warehouses/${id}`,
      providesTags: (result, error, id) => [{ type: "Warehouse", id }],
    }),

    createWarehouse: builder.mutation<string, CreateWarehouseDto>({
      query: body => ({
        url: "/warehouses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Warehouse"],
    }),

    updateWarehouse: builder.mutation<
      object,
      { id: string; body: Partial<CreateWarehouseDto> }
    >({
      query: ({ id, body }) => ({
        url: `/warehouses/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Warehouse", id },
        "Warehouse",
      ],
    }),

    deleteWarehouse: builder.mutation<void, string>({
      query: id => ({
        url: `/warehouses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Warehouse"],
    }),

    addStock: builder.mutation<
      object,
      { warehouseId: string; body: AddStockDto }
    >({
      query: ({ warehouseId, body }) => ({
        url: `/warehouses/${warehouseId}/stock`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { warehouseId }) => [
        { type: "Warehouse", id: warehouseId },
        "Stock",
      ],
    }),

    getStock: builder.query<
      StockItem[],
      { warehouseId: string; productId?: string }
    >({
      query: ({ warehouseId, productId }) => ({
        url: `/warehouses/${warehouseId}/stock`,
        params: productId ? { productId } : undefined,
      }),
      providesTags: ["Stock"],
    }),

    getObjects: builder.query<ObjectType[], void>({
      query: () => "/objects",
      providesTags: ["Object"],
    }),

    getObject: builder.query<ObjectType, string>({
      query: id => `/objects/${id}`,
      providesTags: (result, error, id) => [{ type: "Object", id }],
    }),

    createObject: builder.mutation<string, CreateObjectDto>({
      query: body => ({
        url: "/objects",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Object"],
    }),

    updateObject: builder.mutation<
      object,
      { id: string; body: Partial<CreateObjectDto> }
    >({
      query: ({ id, body }) => ({
        url: `/objects/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Object", id },
        "Object",
      ],
    }),

    deleteObject: builder.mutation<void, string>({
      query: id => ({
        url: `/objects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Object"],
    }),

    getShipments: builder.query<Shipment[], void>({
      query: () => "/shipments",
      providesTags: ["Shipment"],
    }),

    getShipment: builder.query<Shipment, string>({
      query: id => `/shipments/${id}`,
      providesTags: (result, error, id) => [{ type: "Shipment", id }],
    }),

    createShipment: builder.mutation<object, CreateShipmentDto>({
      query: body => ({
        url: "/shipments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Shipment", "Stock", "Warehouse"],
    }),

    updateShipmentStatus: builder.mutation<
      object,
      { id: string; body: UpdateShipmentStatusDto }
    >({
      query: ({ id, body }) => ({
        url: `/shipments/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Shipment", id },
        "Shipment",
      ],
    }),

    deleteShipment: builder.mutation<void, string>({
      query: id => ({
        url: `/shipments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Shipment", "Stock", "Warehouse"],
    }),

    getShipmentsByObject: builder.query<Shipment[], string>({
      query: objectId => `/shipments/by-object/${objectId}`,
      providesTags: ["Shipment"],
    }),

    getShipmentsByWarehouse: builder.query<Shipment[], string>({
      query: warehouseId => `/shipments/by-warehouse/${warehouseId}`,
      providesTags: ["Shipment"],
    }),

    getAllPriceLists: builder.query<PriceListResponse, void>({
      query: () => "/warehouses/price-lists/all",
      providesTags: ["PriceList"],
    }),

    getWarehousePriceList: builder.query<PriceListResponse, string>({
      query: warehouseId => `/warehouses/${warehouseId}/price-list`,
      providesTags: (result, error, warehouseId) => [
        { type: "PriceList", id: warehouseId },
      ],
    }),

    // Эндпоинт с фильтрацией
    getFilteredPriceLists: builder.query<
      PriceListResponse,
      {
        warehouseId?: string;
        category?: string;
        manufacturer?: string;
        minPrice?: number;
        maxPrice?: number;
      }
    >({
      query: params => {
        // Строим query string из параметров
        const queryParams = new URLSearchParams();
        if (params.warehouseId)
          queryParams.append("warehouseId", params.warehouseId);
        if (params.category) queryParams.append("category", params.category);
        if (params.manufacturer)
          queryParams.append("manufacturer", params.manufacturer);
        if (params.minPrice)
          queryParams.append("minPrice", params.minPrice.toString());
        if (params.maxPrice)
          queryParams.append("maxPrice", params.maxPrice.toString());

        return `/warehouses/price-lists/filtered?${queryParams.toString()}`;
      },
      providesTags: ["Price"],
    }),
  }),
});

export const {
  useGetWarehousesQuery,
  useGetWarehouseQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
  useAddStockMutation,
  useGetStockQuery,

  useGetObjectsQuery,
  useGetObjectQuery,
  useCreateObjectMutation,
  useUpdateObjectMutation,
  useDeleteObjectMutation,

  useGetShipmentsQuery,
  useGetShipmentQuery,
  useCreateShipmentMutation,
  useUpdateShipmentStatusMutation,
  useDeleteShipmentMutation,
  useGetShipmentsByObjectQuery,
  useGetShipmentsByWarehouseQuery,

  useGetAllPriceListsQuery,
  useGetWarehousePriceListQuery,
  useGetFilteredPriceListsQuery,
} = warehouseApi;
