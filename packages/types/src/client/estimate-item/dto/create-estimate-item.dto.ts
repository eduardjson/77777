export interface CreateEstimateItemDto {
  productId?: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  total: number;
}
