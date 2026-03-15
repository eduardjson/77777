import { DocumentType } from '../../../shared/enums';

export interface ProjectDocumentDto {
  id: string;
  projectId: string;
  data: Buffer;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: Date;
  docType: DocumentType;
}
