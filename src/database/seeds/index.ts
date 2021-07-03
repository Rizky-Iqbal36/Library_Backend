import { Injectable } from '@nestjs/common'
import { SeedUserData } from '@database/seeds/user.seed'
import { SeedBookData } from '@database/seeds/book.seed'
import { SeedCategoryData } from '@database/seeds/category.seed'

export const seedFiles = [SeedBookData, SeedCategoryData, SeedUserData]

@Injectable()
export default class Seeds {
  constructor(
    private readonly bookDataSeed: SeedBookData,
    private readonly seedCategoryData: SeedCategoryData,
    private readonly seedUserData: SeedUserData
  ) {}

  async exec() {
    await this.registerSeeder()
  }

  private async registerSeeder() {
    await this.seedUserData.createOne({ admin: true, email: 'admin@admin.com', password: 'lumosmaxima' })
    await this.bookDataSeed.createMany(10)
    await this.seedUserData.createMany(10)
  }
}
