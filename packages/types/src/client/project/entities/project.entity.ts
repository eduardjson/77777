import { ProjectStatus } from '@prisma/client';
import { ProjectImageInterface } from '../../project-image/entities/project-image.entity';
import { ProjectDocumentInterface } from '../../project-document/entities/project-document.entity';
import { EstimateInterface } from '../../estimate/entities/estimate.entity';

export interface ProjectInterface {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  images?: ProjectImageInterface[];
  documents?: ProjectDocumentInterface[];
  estimate?: EstimateInterface | null;
  status: ProjectStatus;
}
