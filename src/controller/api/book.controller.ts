import { Controller, Get, Param } from '@nestjs/common'
import { BookService } from '@root/services/book.service'
import mongoose from 'mongoose'

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
      return {}
    }
  }
}
