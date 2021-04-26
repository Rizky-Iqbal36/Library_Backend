import { BookRepository } from '@root/repositories/book.repository'
import { CategoryRepository } from '@root/repositories/category.repository'
import { UserRepository } from '@root/repositories/user.repository'

export const repositories = [BookRepository, CategoryRepository, UserRepository]
