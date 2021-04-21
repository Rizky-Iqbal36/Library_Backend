import { Injectable } from '@nestjs/common'
import { SeedBookData } from '@database/seeds/book.seed'
import { SeedCategoryData } from '@database/seeds/category.seed'

export const seedFiles = [SeedBookData, SeedCategoryData]

@Injectable()
export default class Seeds {
  constructor(private readonly bookDataSeed: SeedBookData, private readonly seedCategoryData: SeedCategoryData) {}

  async exec() {
    await this.registerSeeder()
  }

  private async registerSeeder() {
    await this.bookDataSeed.createMany(10)
  }
}
