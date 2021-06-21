import { Controller, Post, Get, Put, Delete, Param, Req, UseInterceptors, UseGuards } from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'

import { CloudStorage } from '@app/utils/cloudinary/cloudinary.provider'

import { AdminGuard } from '@root/app/guard/admin.guard'

import { BookService } from '@root/services/book.service'
import { BadRequestException } from '@root/app/exception/httpException'
import { httpFlags } from '@root/constant/flags'
import { BaseController } from '@root/controller/base.controller'

import { Request } from 'express'
import mongoose from 'mongoose'

@Controller('book')
export class BookController extends BaseController {
  constructor(private readonly bookService: BookService) {
    super()
  }

  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'thumbnail', maxCount: 1 },
        { name: 'file', maxCount: 1 }
      ],
      {
        storage: CloudStorage,
        fileFilter: (req, file, cb) => {
          if (!file.mimetype.match('image') && file.fieldname == 'thumbnail') {
            return cb(new BadRequestException(httpFlags.INVALID_FILETYPE, 'Please select an image file type'), false)
          }
          if (file.fieldname == 'file') {
            if (!file.originalname.match(/\.(pdf|PDF)$/)) {
              return cb(new BadRequestException(httpFlags.INVALID_FILETYPE, 'Only pdf file is allowed!'), false)
            }
          }
          cb(null, true)
        },
        limits: {
          fileSize: 15 * 1000 * 1000
        }
      }
    )
  )
  @Post()
  async createBook(@Req() req: Request) {
    await this.validateRequest(req, BaseController.schemas.bookSchema.createBook)
    const userId = req.header('x-user-id')
    try {
      if (!req.files['thumbnail']) throw new Error('Book validation failed: thumbnail required')
      else if (!req.files['file']) throw new Error('Book validation failed: file required')

      return this.bookService.createBook(req.body, userId)
    } catch (err) {
      throw new BadRequestException(httpFlags.INVALID_BODY, err.message)
    }
  }

  @Get()
  async getBooks(@Req() req: Request) {
    await this.validateRequest(req, BaseController.schemas.bookSchema.getBooks)
    const page = parseInt(req.query.page as any) || 1
    return this.bookService.findAllBook(page)
  }

  @Get('/:id')
  async getBook(@Param('id') id: string, @Req() req: Request) {
    await this.validateRequest(req, BaseController.schemas.bookSchema.getBook)
    const isValidID = mongoose.Types.ObjectId.isValid(id)
    const { bookmark } = req.query
    const userId = req.header('x-user-id')
    if (isValidID) {
      return this.bookService.findOneBook(id, userId, bookmark as string)
    } else {
      throw new BadRequestException(httpFlags.INVALID_PARAM)
    }
  }

  @Put('/:id')
  async updateBook(@Param('id') id: string, @Req() req: Request) {
    await this.validateRequest(req, BaseController.schemas.bookSchema.updateBook)
    const isValidID = mongoose.Types.ObjectId.isValid(id)
    if (isValidID) {
      return this.bookService.updateBook(id, req.body)
    } else {
      throw new BadRequestException(httpFlags.INVALID_PARAM)
    }
  }

  @Put('approve/:id')
  @UseGuards(AdminGuard)
  async bookApprover(@Param('id') id: string, @Req() req: Request) {
    await this.validateRequest(req, BaseController.schemas.bookSchema.approveBook)
    const isValidID = mongoose.Types.ObjectId.isValid(id)
    if (isValidID) {
      return this.bookService.bookApprover(id, req.body)
    } else {
      throw new BadRequestException(httpFlags.INVALID_PARAM)
    }
  }

  @Delete('/:id')
  async deleteBook(@Param('id') id: string) {
    const isValidID = mongoose.Types.ObjectId.isValid(id)
    if (isValidID) {
      return this.bookService.deleteBook(id)
    } else {
      throw new BadRequestException(httpFlags.INVALID_PARAM)
    }
  }
}
