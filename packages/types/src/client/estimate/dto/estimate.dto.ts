export interface EstimateDto {
  id: string;
  projectId: string;
  totalCost: number;
  laborCost: number | null;
  materialsCost: number | null;
  createdAt: Date;
  updatedAt: Date;
}
