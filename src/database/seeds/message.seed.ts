import faker from 'faker'
import { Injectable } from '@nestjs/common'
import { MessageRepository } from '@root/repositories/message.repository'
import { IMessageDoc, IMessage } from '@database/models/message.model'

@Injectable()
export class MessageSeedData {
  constructor(private readonly messageRepository: MessageRepository) {}

  public async createMany(loop: number) {
    const messages: IMessageDoc[] = []
    for (let i = 0; i < loop; i++) {
      messages.push(await this.createOne({}))
    }
    return messages
  }

  public async createOne({
    conversationId = faker.datatype.uuid(),
    senderId = faker.datatype.uuid(),
    text = faker.lorem.words(4)
  }: IMessage) {
    return this.messageRepository.makeMessage({ conversationId, senderId, text })
  }
}
