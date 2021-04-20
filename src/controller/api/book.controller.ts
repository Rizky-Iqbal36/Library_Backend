import { Controller, Get } from '@nestjs/common'
import { BookService } from '@root/services/book.service'

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}
  @Get()
  async getAll() {
    return this.bookService.findAllBook()
  }
}
