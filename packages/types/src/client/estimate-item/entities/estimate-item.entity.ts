import { CostType } from '@prisma/client';
import { EstimateInterface } from '../../estimate/entities/estimate.entity';

export interface EstimateItemInterface {
  id: string;
  estimateId: string;
  estimate?: EstimateInterface;
  productId: string | null;
  name: string;
  description: string | null;
  quantity: number;
  unit: string;
  price: number;
  total: number;
  costType: CostType;
}
