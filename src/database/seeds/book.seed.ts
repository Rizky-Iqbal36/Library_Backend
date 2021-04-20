import faker from 'faker'
import { BookRepository } from '@root/repositories/book.repository'
import { Injectable } from '@nestjs/common'

@Injectable()
export class BookDataSeed {
  constructor(private readonly bookRepository: BookRepository) {}
  async createMany(loop: number) {
    await this.bookRepository.delete({})
    const all = []
    for (let i = 0; i < loop; i++) {
      all.push(await this.createOne())
    }
    return all
  }

  async createOne() {
    return this.bookRepository.save({
      isActive: faker.datatype.boolean(),
      title: faker.name.title(),
      ISBN: faker.finance.creditCardNumber(),
      author: `${faker.name.firstName()} ${faker.name.middleName()} ${faker.name.lastName()}`,
      publication: faker.date.past(10, new Date()),
      pages: faker.datatype.number(),
      uploadBy: faker.datatype.uuid(),
      aboutBook: faker.commerce.productDescription(),
      bookMarked: faker.datatype.number(),
      views: faker.datatype.number(),
      thumbnail: faker.image.animals(),
      file: `file_${faker.lorem.sentence(1)}epub`
    })
  }
}
