import { Injectable } from '@nestjs/common'
import { BookRepository } from '@root/repositories/book.repository'

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
      await this.bookRepository.save(book)
      return book
    } else {
      return {}
    }
  }
}
