import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Prisma } from 'generated/prisma/client';
import { Server, Socket } from 'socket.io';
import * as types from 'src/types';
const CLIENT_URI = 'http://localhost:5173';

import { ChatService } from './chat.service';

const users: Record<string, string> = {};

@WebSocketGateway({
  cors: {
    origin: CLIENT_URI,
  },
  serveClient: false,
  namespace: 'chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly appService: ChatService) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('messages:get')
  async handleMessagesGet(): Promise<void> {
    const messages = await this.appService.getMessages();
    this.server.emit('messages', messages);
  }

  @SubscribeMessage('messages:clear')
  async handleMessagesClear(): Promise<void> {
    await this.appService.clearMessages();
  }

  @SubscribeMessage('message:post')
  async handleMessagePost(
    @MessageBody()
    payload: Prisma.MessageCreateInput & { attachments?: any[] },
  ): Promise<void> {
    const createdMessage = await this.appService.createMessage(payload);
    this.server.emit('message:post', createdMessage);
    this.handleMessagesGet();
  }

  @SubscribeMessage('message:put')
  async handleMessagePut(
    @MessageBody()
    payload: types.MessageUpdatePayload,
  ): Promise<void> {
    const updatedMessage = await this.appService.updateMessage(payload);
    this.server.emit('message:put', updatedMessage);
    this.handleMessagesGet();
  }

  @SubscribeMessage('message:delete')
  async handleMessageDelete(
    @MessageBody()
    payload: Prisma.MessageWhereUniqueInput,
  ) {
    const removedMessage = await this.appService.removeMessage(payload);
    this.server.emit('message:delete', removedMessage);
    this.handleMessagesGet();
  }

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    const userName = client.handshake.query.userName as string;
    const socketId = client.id;
    users[socketId] = userName;

    client.broadcast.emit('log', `${userName} connected`);
  }

  handleDisconnect(client: Socket) {
    const socketId = client.id;
    const userName = users[socketId];
    delete users[socketId];

    client.broadcast.emit('log', `${userName} disconnected`);
  }
}
