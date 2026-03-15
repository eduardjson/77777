import { AttachmentInterface } from '../../attachment/entities/attachment.entity';

export interface MessageInterface {
  id: number;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
  attachments?: AttachmentInterface[];
}
