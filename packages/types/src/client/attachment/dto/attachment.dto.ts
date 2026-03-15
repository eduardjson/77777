export interface AttachmentDto {
  id: string;
  messageId: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  uploadedAt: Date;
}
