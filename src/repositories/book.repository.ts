import { Injectable } from '@nestjs/common'
import { BookModel, IBook } from '@database/models/book.model'

@Injectable()
export class BookRepository {
  private readonly bookModel = BookModel

  public async getAllBooks() {
    return this.bookModel.find().sort({ publication: -1 })
  }

  public async getOneBook(id: string, populate?: boolean) {
    if (populate) return this.bookModel.findById(id).populate('categoryIds')
    else return this.bookModel.findById(id)
  }

  public async createBook(data: IBook) {
    return this.bookModel.create(data)
  }
}
