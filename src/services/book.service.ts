import { Injectable } from '@nestjs/common'
import { BookRepository } from '@root/repositories/book.repository'
import { UserRepository } from '@root/repositories/user.repository'
import { BadRequestException } from '@root/app/exception/httpException'
import { httpFlags } from '@root/constant/flags'

@Injectable()
export class BookService {
  constructor(private readonly bookRepository: BookRepository, private readonly userRepository: UserRepository) {}

  public async findAllBook() {
    return this.bookRepository.getAllBooks()
  }

  public async findOneBook(id: string, userId: string, bookmark?: string) {
    const book = await this.bookRepository.getOneBook(id)
    const user = await this.userRepository.getOneUser(userId)
    if (book) {
      if (bookmark === 'BOOKMARK') {
        user.bookmarkedBook.push(book._id)
        user.totalBookmarked += 1
        user.save()

        book.bookMarkedBy.push(user._id)
        book.bookMarked += 1
      } else if (bookmark === 'UNBOOKMARK') {
        const bookIndex = book.bookMarkedBy.indexOf(user._id)
        book.bookMarkedBy.splice(bookIndex, 1)
        book.bookMarked -= 1

        const userIndex = user.bookmarkedBook.indexOf(book._id)
        user.bookmarkedBook.splice(userIndex, 1)
        user.totalBookmarked -= 1
        user.save()
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
