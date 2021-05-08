import faker from 'faker'
import { Injectable } from '@nestjs/common'
import { CategoryRepository } from '@root/repositories/category.repository'

@Injectable()
export class SeedCategoryData {
  constructor(private readonly categoryRepository: CategoryRepository) {}
  async createMany(loop: number) {
    const all = []
    for (let i = 0; i < loop; i++) {
      all.push(await this.createOne({ index: i }))
    }
    return all
  }

  async createOne({
    name = faker.lorem.sentence(faker.datatype.number({ min: 1, max: 5 })),
    bookId = [],
    index = 1
  }: {
    name?: string
    bookId?: string[]
    index?: number
  }) {
    return this.categoryRepository.createCategory({
      isActive: index % 2 === 1 ? true : false,
      name,
      numberOfBook: 0,
      ...(bookId ? { books: bookId } : {}),
      description: faker.commerce.productDescription()
    })
  }
}
