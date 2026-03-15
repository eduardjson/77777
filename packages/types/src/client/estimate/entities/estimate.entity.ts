import { ProjectInterface } from '../../project/entities/project.entity';
import { EstimateItemInterface } from '../../estimate-item/entities/estimate-item.entity';

export interface EstimateInterface {
  id: string;
  projectId: string;
  project?: ProjectInterface;
  items?: EstimateItemInterface[];
  totalCost: number;
  laborCost: number | null;
  materialsCost: number | null;
  createdAt: Date;
  updatedAt: Date;
}
