import { Injectable } from '@nestjs/common'
import { SeedUserData } from '@database/seeds/user.seed'
import { SeedBookData } from '@database/seeds/book.seed'
import { SeedCategoryData } from '@database/seeds/category.seed'

import { SeedBlogData } from '@database/seeds/blog.seed'

import { ConversationSeedData } from '@database/seeds/conversation.seed'
import { MessageSeedData } from '@database/seeds/message.seed'

export const seedFiles = [
  SeedBookData,
  SeedCategoryData,
  SeedUserData,
  SeedBlogData,
  ConversationSeedData,
  MessageSeedData
]

@Injectable()
export default class Seeds {
  constructor(
    private readonly bookDataSeed: SeedBookData,
    private readonly seedCategoryData: SeedCategoryData,
    private readonly seedUserData: SeedUserData,

    private readonly seedBlogData: SeedBlogData,

    private readonly conversationSeedData: ConversationSeedData,
    private readonly messageSeedData: MessageSeedData
  ) {}

  async exec() {
    await this.registerSeeder()
  }

  private async registerSeeder() {
    await this.seedUserData.createOne({ admin: true, email: 'admin@admin.com', password: 'lumosmaxima' })
    await this.bookDataSeed.createMany(10)
    await this.seedUserData.createMany(10)

    await this.seedBlogData.createMany(10)

    await this.conversationSeedData.createMany(10)
    await this.messageSeedData.createMany(10)
  }
}
