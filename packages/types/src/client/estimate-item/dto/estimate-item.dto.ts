import { CostType } from '@prisma/client';

export interface EstimateItemDto {
  id: string;
  estimateId: string;
  productId: string | null;
  name: string;
  description: string | null;
  quantity: number;
  unit: string;
  price: number;
  total: number;
  costType: CostType;
}
