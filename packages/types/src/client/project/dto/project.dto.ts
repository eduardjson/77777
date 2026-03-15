import { ProjectStatus } from '@prisma/client';

export interface ProjectDto {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  status: ProjectStatus;
}
