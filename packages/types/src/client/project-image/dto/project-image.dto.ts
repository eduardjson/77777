export interface ProjectImageDto {
  id: string;
  projectId: string;
  data: Buffer;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: Date;
  sortOrder: number;
}
