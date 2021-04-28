import { Controller, Get, Param, Req } from '@nestjs/common'
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

  @Get()
  async getAll() {
    return this.bookService.findAllBook()
  }

  @Get('/:id')
  async getOne(@Param('id') id: string, @Req() req: Request) {
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
}
