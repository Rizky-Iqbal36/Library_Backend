import faker from 'faker'
import { BlogRepository } from '@root/repositories/blog.respository'
import { Injectable } from '@nestjs/common'

@Injectable()
export class SeedBlogData {
  constructor(private readonly blogRepository: BlogRepository) {}
  async createMany(loop: number) {
    const all = []
    for (let i = 0; i < loop; i++) {
      all.push(await this.createOne({}))
    }
    return all
  }

  async createOne({
    bookMarkedBy = [],
    author = '607ea12bd21e76a4433ea592'
  }: {
    bookMarkedBy?: string[]
    author?: string
  }) {
    return this.blogRepository.createBlog({
      author,
      title: faker.name.title(),
      isActive: faker.datatype.boolean(),
      publication: faker.date.past(10, new Date()),
      views: 0,
      blogThumbnail: faker.image.animals(),
      ...(bookMarkedBy.length > 0 ? { bookMarkedBy } : {}),
      content: faker.commerce.productDescription(),
      tags: [faker.commerce.productName()],
      bookMarked: 0
    })
  }
}
