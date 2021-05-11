import { Controller, Post, Get, Put, Delete, Param, Req } from '@nestjs/common'
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

  @Post()
  async createBook(@Req() req: Request) {
    await this.validateRequest(req, BaseController.schemas.bookSchema.createBook)
    const userId = req.header('x-user-id')
    return this.bookService.createBook(req.body, userId)
  }

  @Get()
  async getBooks() {
    return this.bookService.findAllBook()
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
