import { Injectable } from '@nestjs/common'
import { ConversationModel, IConversation } from '@database/models/conversation.model'

@Injectable()
export class ConversationRepository {
  private readonly conversationModel = ConversationModel

  public async makeConversation(data: IConversation) {
    return this.conversationModel.create(data)
  }

  public async getConversationsByMemberId(memberId: string) {
    return this.conversationModel.find({
      members: { $in: [memberId] }
    })
  }
}
