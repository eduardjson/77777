import { ProjectInterface } from '../../project/entities/project.entity';

export interface ProjectImageInterface {
  id: string;
  projectId: string;
  project?: ProjectInterface;
  data: Buffer;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: Date;
  sortOrder: number;
}
