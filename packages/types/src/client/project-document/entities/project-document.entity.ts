import { DocumentType } from '@prisma/client';
import { ProjectInterface } from '../../project/entities/project.entity';

export interface ProjectDocumentInterface {
  id: string;
  projectId: string;
  project?: ProjectInterface;
  data: Buffer;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: Date;
  docType: DocumentType;
}
