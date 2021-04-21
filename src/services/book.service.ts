import { Injectable } from '@nestjs/common'
import { BookRepository } from '@root/repositories/book.repository'
import { BadRequestException } from '@root/app/exception/httpException'
import { httpFlags } from '@root/constant/flags'

@Injectable()
export class BookService {
  constructor(private readonly bookRepository: BookRepository) {}

  public async findAllBook() {
    return this.bookRepository.getAllBooks()
  }

  public async findOneBook(id: string) {
    const book = await this.bookRepository.getOneBook(id)
    if (book) {
      book.views += 1
      await book.save()
      return book
    } else {
      throw new BadRequestException(httpFlags.BOOK_NOT_FOUND)
    }
  }
}
