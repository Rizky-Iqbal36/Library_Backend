import { Injectable } from '@nestjs/common'
import { BlogRepository } from '@root/repositories/blog.respository'
import { IBlog } from '@root/database/models/blog.model'
import { NotFoundException } from '@root/app/exception/httpException'
import { httpFlags } from '@root/constant/flags'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class BlogService {
  constructor(private readonly blogRepository: BlogRepository) {}

  public async findAllBlogs(page: number) {
    const take = 10
    const skip = (page - 1) * take
    const blogs = await this.blogRepository.getAllBlogs({ options: { skip, take } })
    const totalBlogs = await this.blogRepository.countBlogs()
    return {
      currentPage: page,
      totalPage: Math.ceil(totalBlogs / take),
      totalBlogsOnThisPage: blogs.length,
      data: blogs
    }
  }

  public async findOneBlog(id: string) {
    const blog = await this.blogRepository.getOneBlog(id)

    if (!blog)
      throw new NotFoundException(httpFlags.BLOG_NOT_FOUND, {
        localeMessage: { key: 'BLOG_NOT_FOUND', vars: { blogId: id } }
      })

    return { id, content: blog.content }
  }

  public async createBlog(data: IBlog, userId: string) {
    data.author = userId
    data.publication = new Date()
    data.blogThumbnail = 'blogThumbnail-' + userId + `-${uuidv4()}.jpg`
    const blog = await this.blogRepository.createBlog(data)
    return {
      id: blog._id,
      message: 'New blog succesfully created'
    }
  }
}
