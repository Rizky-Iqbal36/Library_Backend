import faker from 'faker'
import { Injectable } from '@nestjs/common'
import { ConversationRepository } from '@root/repositories/conversation.repository'
import { IConversationDoc } from '@database/models/conversation.model'

@Injectable()
export class ConversationSeedData {
  constructor(private readonly conversationRepository: ConversationRepository) {}

  public async createMany(loop: number) {
    const data: IConversationDoc[] = []
    for (let i = 0; i < loop; i++) {
      data.push(await this.createOne({}))
    }
    return data
  }

  public async createOne({
    senderId = faker.datatype.uuid(),
    receiverId = faker.datatype.uuid()
  }: {
    senderId?: string
    receiverId?: string
  }) {
    return this.conversationRepository.makeConversation({ members: [senderId, receiverId] })
  }
}
