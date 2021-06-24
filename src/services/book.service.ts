import { Injectable } from '@nestjs/common'
import config from '@root/app/config/appConfig'

import { BadRequestException, UnauthorizedException } from '@root/app/exception/httpException'
import { httpFlags } from '@root/constant/flags'

import { IBook } from '@root/database/models/book.model'
import { UpdateBookEnum, BookStatusEnum } from '@root/interfaces/enum'

import { BookRepository } from '@root/repositories/book.repository'
import { UserRepository } from '@root/repositories/user.repository'
import { CategoryRepository } from '@root/repositories/category.repository'

import { UserService } from '@root/services/user.service'
@Injectable()
export class BookService {
  constructor(
    private readonly bookRepository: BookRepository,
    private readonly userRepository: UserRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly userService: UserService
  ) {}

  public async findAllBook(page: number) {
    const take = 10
    const skip = (page - 1) * take
    const books = await this.bookRepository.getAllBooks({ options: { skip, take } })
    const totalBooks = await this.bookRepository.countBooks()
    return {
      currentPage: page,
      totalPage: Math.ceil(totalBooks / take),
      totalBookOnThisPage: books.length,
      data: books
    }
  }

  public async findOneBook(id: string, userId: string, bookmark?: string) {
    const book = await this.bookRepository.getOneBook(id, true)
    const user = await this.userRepository.getOneUser(userId, true)
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

  public async createBook(body: IBook, userId: string) {
    body.isActive = false
    body.status = BookStatusEnum.WAIT
    body.uploadBy = userId

    const user = await this.userService.findOneUser(userId)
    const count = user.uploadedBook.length || 0

    body.file = 'file-' + userId + `-${count}.pdf`
    body.thumbnail = 'thumbnail-' + userId + `-${count}.jpg`

    const createdBook = await this.bookRepository.createBook(body)

    createdBook.file = `${config.cloudinary.assets.replace(/rizkyiqbal/, 'rizkyiqbal/raw/upload')}/files/${userId}/${
      createdBook.file
    }`
    createdBook.thumbnail = `${config.cloudinary.assets}/thumbnails/${userId}/${createdBook.thumbnail}`

    return createdBook
  }

  public async updateBook(id: string, body: IBook) {
    const { aboutBook, authors, categoryIds, file, isbn, pages, thumbnail, publication, title } = body
    const book = await this.bookRepository.getOneBook(id, false)
    if (book) {
      book.isActive = false
      book.status = BookStatusEnum.WAIT
      book.aboutBook = aboutBook || book.aboutBook
      authors?.map(result => book.authors.push(result))
      book.file = file || book.file
      book.isbn = isbn || book.isbn
      book.pages = pages || book.pages
      book.thumbnail = thumbnail || book.thumbnail
      book.publication = publication || book.publication
      book.title = title || book.title
      await Promise.all(
        categoryIds?.map(async categoryId => {
          const category = await this.categoryRepository.getCategoryById(categoryId)
          if (!category) throw new BadRequestException(httpFlags.CATEGORY_NOT_FOUND)
          book.categoryIds.push(categoryId)
        })
      )
      await book.save()
      return book
    } else {
      throw new BadRequestException(httpFlags.BOOK_NOT_FOUND)
    }
  }

  public async bookApprover(id: string, body: IBook) {
    const { status } = body
    const book = await this.bookRepository.getOneBook(id, false)

    if (book) {
      if (status === book.status) throw new BadRequestException(httpFlags.BOOK_SAME_STATUS)

      if (status === BookStatusEnum.ACTIVE) {
        book.isActive = true
        book.status = BookStatusEnum.ACTIVE
        await this.updateBookOnCategory(book.categoryIds, book._id, UpdateBookEnum.ADD)
        await book.save()
      } else {
        book.isActive = false
        book.status === BookStatusEnum.ACTIVE
          ? await this.updateBookOnCategory(book.categoryIds, book._id, UpdateBookEnum.DELETE)
          : []
        book.status = status
        await book.save()
      }

      return book
    } else {
      throw new BadRequestException(httpFlags.BOOK_NOT_FOUND)
    }
  }

  public async deleteBook(id: string, userId: string) {
    const book = await this.bookRepository.getOneBook(id, false)
    const user = await this.userService.findOneUser(userId)
    if (book) {
      if (user.isAdmin || book.uploadBy.toString() === userId) {
        book.isActive ? await this.updateBookOnCategory(book.categoryIds, book._id, UpdateBookEnum.DELETE) : null
        await this.bookRepository.deleteOneBook(id)
        return {
          message: `Book with id: ${id} has successfully deleted`
        }
      } else {
        throw new UnauthorizedException(
          httpFlags.UNAUTHORIZED,
          `You don't have permission to delete book with id: ${id}`
        )
      }
    } else {
      throw new BadRequestException(httpFlags.BOOK_NOT_FOUND)
    }
  }

  private async updateBookOnCategory(categories: string[], bookId: string, method: UpdateBookEnum) {
    return Promise.all(
      categories.map(async categoryId => {
        const category = await this.categoryRepository.getCategoryById(categoryId)
        if (category) {
          if (method === UpdateBookEnum.ADD) {
            category.books.push(bookId)
            category.numberOfBook += 1
          } else {
            const bookIndex = category.books.indexOf(bookId)
            category.books.splice(bookIndex, 1)
            category.numberOfBook -= 1
          }
          await category.save()
          return categoryId
        } else {
          throw new BadRequestException(httpFlags.CATEGORY_NOT_FOUND)
        }
      })
    )
  }
}
