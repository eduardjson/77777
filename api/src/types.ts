import { Prisma } from 'generated/prisma/client';

// { id?: number, text?: string }
export type MessageUpdatePayload = Prisma.MessageWhereUniqueInput &
  Pick<Prisma.MessageUpdateInput, 'text'>;

export type UserInfo = {
  userId: string;
  userName: string;
};

// export interface MessageUpdatePayload {
//   id: number;
//   text: string;
// }

export interface MessageWithAttachments {
  id: number;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  messageId: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  uploadedAt: Date;
}
