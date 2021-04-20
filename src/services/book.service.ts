import { Injectable } from '@nestjs/common'
import { BookRepository } from '@root/repositories/book.repository'

@Injectable()
export class BookService {
  constructor(private readonly bookRepository: BookRepository) {}

  public async findAllBook() {
    return this.bookRepository.getAllBooks()
  }
}
