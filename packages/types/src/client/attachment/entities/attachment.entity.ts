import { MessageInterface } from '../../message/entities/message.entity';

export interface AttachmentInterface {
  id: string;
  messageId: number;
  message?: MessageInterface;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  uploadedAt: Date;
}
