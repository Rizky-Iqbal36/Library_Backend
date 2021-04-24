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

  public async findOneBook(id: string, bookmark?: string) {
    const book = await this.bookRepository.getOneBook(id)
    if (book) {
      if (bookmark === 'BOOKMARK') {
        book.bookMarked += 1
      } else if (bookmark === 'UNBOOKMARK') {
        book.bookMarked -= 1
      } else {
        book.views += 1
      }
      await book.save()
      return book
    } else {
      throw new BadRequestException(httpFlags.BOOK_NOT_FOUND)
    }
  }
}
