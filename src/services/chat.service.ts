import { Injectable } from '@nestjs/common'
import { ConversationRepository } from '@root/repositories/conversation.repository'
import { MessageRepository } from '@root/repositories/message.repository'

import { IMessage } from '@database/models/message.model'

@Injectable()
export class ChatServie {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository
  ) {}

  public async createConversation(members: string[]) {
    return this.conversationRepository.makeConversation({ members })
  }

  public async getConversationsByUserId(userId: string) {
    return this.conversationRepository.getConversationsByMemberId(userId)
  }

  public async createMessage(body: IMessage) {
    return this.messageRepository.makeMessage(body)
  }

  public async getMessages(conversationId: string) {
    return this.messageRepository.getMessagesByConversationId(conversationId)
  }
}
