import { Injectable } from '@nestjs/common'

import { NotFoundException } from '@app/exception/httpException'
import { getLocalizedMsg } from '@app/i18n/translation'

import { IBlog } from '@database/models/blog.model'

import { httpFlags } from '@root/constant/flags'
import { BlogRepository } from '@root/repositories/blog.respository'

import { UserService } from '@root/services/user.service'

@Injectable()
export class BlogService {
  constructor(private readonly blogRepository: BlogRepository, private readonly userService: UserService) {}

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

    return { id, title: blog.title, content: blog.content }
  }

  public async createBlog(data: IBlog, userId: string, lang?: string) {
    const user = await this.userService.findOneUser(userId)

    data.author = userId
    data.publication = new Date()

    const count = user.postedBlogs.length

    data.blogThumbnail = 'blogThumbnail-' + userId + `-${count}.jpg`
    const blog = await this.blogRepository.createBlog(data)
    user.postedBlogs.push(blog._id)
    await user.save()

    return {
      id: blog._id,
      message: getLocalizedMsg({ key: 'BLOG_CREATED' }, lang || 'en')
    }
  }
}
