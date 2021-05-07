import { BookService } from './book.service'
import { UserService } from './user.service'
import { CategoryService } from './category.service'

import { AuthService } from '@root/authentication/service/auth.service'
export const services = [BookService, UserService, AuthService, CategoryService]
