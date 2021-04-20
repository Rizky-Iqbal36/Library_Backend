import { Controller, Get, Param } from '@nestjs/common'
import { BookService } from '@root/services/book.service'
import { BadRequestException } from '@root/app/exception/httpException'
import mongoose from 'mongoose'
import { httpFlags } from '@root/constant/flags'
@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  async getAll() {
    return this.bookService.findAllBook()
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    const isValidID = mongoose.Types.ObjectId.isValid(id)
    if (isValidID) {
      return this.bookService.findOneBook(id)
    } else {
      throw new BadRequestException(httpFlags.INVALID_PARAM)
    }
  }
}
