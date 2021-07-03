import { Injectable } from '@nestjs/common'
import { BookModel, IBook } from '@database/models/book.model'
import { IQueryGetAll } from '@root/interfaces'

@Injectable()
export class BookRepository {
  private readonly bookModel = BookModel

  public async getAllBooks(query: IQueryGetAll) {
    return this.bookModel
      .find()
      .sort({ publication: -1 })
      .skip(query.options.skip || 0)
      .limit(query.options.take || 10)
  }

  public async countBooks() {
    return this.bookModel.countDocuments()
  }

  public async getOneBook(id: string, populate?: boolean) {
    if (populate) return this.bookModel.findById(id).populate('categoryIds')
    else return this.bookModel.findById(id)
  }

  public async createBook(data: IBook) {
    return this.bookModel.create(data)
  }

  public async deleteOneBook(id: string) {
    return this.bookModel.findByIdAndRemove(id)
  }
}
