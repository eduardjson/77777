import { Prisma } from "@prisma/client";

export type UserInfo = {
  userId: string;
  userName: string;
};

export type MessageUpdatePayload = Prisma.MessageWhereUniqueInput &
  Pick<Prisma.MessageUpdateInput, "text">;

export interface Attachment {
  id: string;
  messageId: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  uploadedAt: string;
}

export interface Message {
  id: number;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
  attachments?: Attachment[];
}

export interface MessageCreatePayload {
  userId: string;
  userName: string;
  text: string;
  attachments?: {
    fileName: string;
    fileSize: number;
    fileType: string;
    filePath: string;
  }[];
}

// export interface MessageUpdatePayload {
//   id: number;
//   text: string;
// }
export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  manufacturer: string;
  imageUrl: string;
  price: number;
  quantity: number;
  images: ProductImage[];
  stockItems?: StockItem[];
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
}

export interface Warehouse {
  id: string;
  name: string;
  address?: string;
  created_at: string;
  updated_at: string;
  stockItems?: StockItem[];
}

export interface Object {
  id: string;
  name: string;
  address?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  shipments?: Shipment[];
}

export interface StockItem {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
  warehouse?: Warehouse;
}

export type ShipmentStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export interface Shipment {
  id: string;
  warehouseId: string;
  objectId: string;
  status: ShipmentStatus;
  created_at: string;
  updated_at: string;
  warehouse?: Warehouse;
  object?: Object;
  items?: ShipmentItem[];
}

export interface ShipmentItem {
  id: string;
  shipmentId: string;
  productId: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface CreateWarehouseDto {
  name: string;
  address?: string;
}

export interface CreateObjectDto {
  name: string;
  address?: string;
  description?: string;
}

export interface AddStockDto {
  productId: string;
  quantity: number;
}

export interface CreateShipmentDto {
  warehouseId: string;
  objectId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface UpdateShipmentStatusDto {
  status: ShipmentStatus;
}
