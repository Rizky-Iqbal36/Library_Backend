import {
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets'
import { Logger } from '@nestjs/common'
import { Socket } from 'socket.io'
import { Server } from 'ws'

interface IOnlineUser {
  socketId: string
  userId: string
}

let onlineUsers: IOnlineUser[] = []

@WebSocketGateway(80, {
  namespace: '/chat',
  transports: ['websocket']
})
export class ChattingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server

  private logger: Logger = new Logger('ChattingGateway')

  public afterInit(): void {
    return this.logger.log('Chatting Gateway Initialized')
  }

  public handleDisconnect(client: Socket): void {
    this.setUserOffline(client.id)
    return this.logger.log(`Client disconnected: ${client.id}`)
  }

  public handleConnection(client: Socket): void {
    this.setUserOnline(client.handshake.query.userId, client.id)
    return this.logger.log(`Client connected: ${client.id}`)
  }

  private setUserOnline(userId: any, socketId: string) {
    !onlineUsers.some(user => user.userId === userId) && onlineUsers.push({ userId, socketId })
  }

  private setUserOffline(socketId: string) {
    onlineUsers = onlineUsers.filter(user => user.socketId !== socketId)
  }

  private getUser(userId: string) {
    return onlineUsers.find(user => user.userId === userId)
  }
}
