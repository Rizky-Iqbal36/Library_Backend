import { Injectable } from '@nestjs/common'
import { BlogModel, IBlog } from '@database/models/blog.model'
import { IQueryGetAll } from '@root/interfaces'

@Injectable()
export class BlogRepository {
  private readonly blogModel = BlogModel

  public async getAllBlogs(query: IQueryGetAll) {
    return this.blogModel
      .find()
      .sort({ publication: -1 })
      .skip(query.options.skip || 0)
      .limit(query.options.take || 10)
  }

  public async countBlogs() {
    return this.blogModel.countDocuments()
  }

  public async getOneBlog(id: string, populate?: boolean) {
    if (populate) return this.blogModel.findById(id).populate('author')
    else return this.blogModel.findById(id)
  }

  public async createBlog(data: IBlog) {
    return this.blogModel.create(data)
  }

  public async deleteOneBlog(id: string) {
    return this.blogModel.findByIdAndRemove(id)
  }
}
