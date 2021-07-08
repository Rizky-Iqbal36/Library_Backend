import { BookService } from '@root/services/book.service'
import { UserService } from '@root/services/user.service'
import { CategoryService } from '@root/services/category.service'

import { ChatServie } from '@root/services/chat.service'

import { AuthService } from '@root/authentication/service/auth.service'
export const services = [BookService, UserService, AuthService, CategoryService, ChatServie]
