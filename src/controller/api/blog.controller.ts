import { Controller, Get, Post, Param, Req, UseInterceptors, Res, Render } from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'

import { CloudStorage } from '@app/utils/cloudinary/cloudinary.provider'

import { BlogService } from '@root/services/blog.service'
import { BadRequestException } from '@root/app/exception/httpException'
import { httpFlags } from '@root/constant/flags'
import { BaseController } from '@root/controller/base.controller'

import { Request, Response } from 'express'
import mongoose from 'mongoose'

@Controller('blog')
export class BlogController extends BaseController {
  constructor(private readonly blogService: BlogService) {
    super()
  }

  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'blogThumbnail', maxCount: 1 }], {
      storage: CloudStorage,
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match('image') && file.fieldname == 'blogThumbnail') {
          return cb(
            new BadRequestException(httpFlags.INVALID_FILETYPE, { localeMessage: { key: 'IMAGE_ONLY' } }),
            false
          )
        }
        cb(null, true)
      },
      limits: {
        fileSize: 15 * 1000 * 1000
      }
    })
  )
  @Post()
  async create(@Req() req: Request) {
    await this.validateRequest(req, BaseController.schemas.blogSchema.createBlog)
    const userId = req.header('x-user-id')
    try {
      if (!req.files['blogThumbnail']) throw new Error('Blog validation failed: blogThumbnail required')
      return this.blogService.createBlog(req.body, userId)
    } catch (err) {
      throw new BadRequestException(httpFlags.INVALID_BODY, { plainMessage: err.message })
    }
  }

  @Get()
  async getAll(@Req() req: Request) {
    await this.validateRequest(req, BaseController.schemas.blogSchema.getBlog)
    const page = parseInt(req.query.page as any) || 1
    return this.blogService.findAllBlogs(page)
  }

  @Get('/:id')
  @Render('web/content')
  async getOne(@Res() res: Response, @Param('id') id: string) {
    const isValidID = mongoose.Types.ObjectId.isValid(id)
    if (isValidID) {
      return this.blogService.findOneBlog(id)
    } else {
      throw new BadRequestException(httpFlags.INVALID_PARAM)
    }
  }
}
