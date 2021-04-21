import faker from 'faker'
import { Injectable } from '@nestjs/common'
import { CategoryRepository } from '@root/repositories/category.repository'

@Injectable()
export class SeedCategoryData {
  constructor(private readonly categoryRepository: CategoryRepository) {}
  async createOne(category?: string, bookId?: string) {
    return this.categoryRepository.createCategory({
      isActive: faker.datatype.boolean(),
      name: category ? category : faker.commerce.department(),
      numberOfBook: 0,
      ...(bookId ? { books: [bookId] } : {}),
      description: faker.commerce.productDescription()
    })
  }
}
