import { ProjectStatus } from '../../../shared/enums';

export interface ProjectDto {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  status: ProjectStatus;
}
