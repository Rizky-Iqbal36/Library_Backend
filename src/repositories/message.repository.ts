import { Injectable } from '@nestjs/common'
import { MessageModel, IMessage } from '@database/models/message.model'

@Injectable()
export class MessageRepository {
  private readonly messageModel = MessageModel

  public async makeMessage(data: IMessage) {
    return this.messageModel.create(data)
  }

  public async getMessagesByConversationId(conversationId: string) {
    return this.messageModel.find({ conversationId })
  }
}
