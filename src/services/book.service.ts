import { Injectable } from '@nestjs/common'
import { IBook } from '@root/database/models/book.model'
import { BookRepository } from '@root/repositories/book.repository'
import { UserRepository } from '@root/repositories/user.repository'
import { CategoryRepository } from '@root/repositories/category.repository'
import { BadRequestException } from '@root/app/exception/httpException'
import { httpFlags } from '@root/constant/flags'

@Injectable()
export class BookService {
  constructor(
    private readonly bookRepository: BookRepository,
    private readonly userRepository: UserRepository,
    private readonly categoryRepository: CategoryRepository
  ) {}

  public async findAllBook() {
    return this.bookRepository.getAllBooks()
  }

  public async findOneBook(id: string, userId: string, bookmark?: string) {
    const book = await this.bookRepository.getOneBook(id, true)
    const user = await this.userRepository.getOneUser(userId)
    if (book) {
      if (bookmark === 'BOOKMARK') {
        user.bookmarkedBook.push(book._id)
        user.totalBookmarked += 1
        await user.save()

        book.bookMarkedBy.push(user._id)
        book.bookMarked += 1
      } else if (bookmark === 'UNBOOKMARK') {
        const bookIndex = book.bookMarkedBy.indexOf(user._id)
        book.bookMarkedBy.splice(bookIndex, 1)
        book.bookMarked -= 1

        const userIndex = user.bookmarkedBook.indexOf(book._id)
        user.bookmarkedBook.splice(userIndex, 1)
        user.totalBookmarked -= 1
        await user.save()
      } else {
        book.views += 1
      }
      await book.save()
      return book
    } else {
      throw new BadRequestException(httpFlags.BOOK_NOT_FOUND)
    }
  }

  public async updateBook(id: string, body: IBook) {
    const { aboutBook, authors, categoryIds, file, isbn, pages, thumbnail, publication, title } = body
    const book = await this.bookRepository.getOneBook(id, false)
    if (book) {
      book.isActive = false
      book.status = 'WAIT'
      book.aboutBook = aboutBook ? aboutBook : book.aboutBook
      authors?.map(result => book.authors.push(result))
      book.file = file ? file : book.file
      book.isbn = isbn ? isbn : book.isbn
      book.pages = pages ? pages : book.pages
      book.thumbnail = thumbnail ? thumbnail : book.thumbnail
      book.publication = publication ? publication : book.publication
      book.title = title ? title : book.title
      const updatedBookCategory = categoryIds ? await this.updateBookCategory(categoryIds, book._id) : undefined
      book.categoryIds =
        updatedBookCategory?.length > 0 ? book.categoryIds.concat(updatedBookCategory) : book.categoryIds
      await book.save()
      return book
    } else {
      throw new BadRequestException(httpFlags.BOOK_NOT_FOUND)
    }
  }

  private async updateBookCategory(categories: string[], bookId: string) {
    return Promise.all(
      categories.map(async categoryId => {
        const category = await this.categoryRepository.getCategoryById(categoryId)
        if (category) {
          category.books.push(bookId)
          category.numberOfBook += 1
          await category.save()
          return categoryId
        } else {
          throw new BadRequestException(httpFlags.CATEGORY_NOT_FOUND)
        }
      })
    )
  }
}
