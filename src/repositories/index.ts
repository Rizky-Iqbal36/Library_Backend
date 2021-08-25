import { BookRepository } from '@root/repositories/book.repository'
import { CategoryRepository } from '@root/repositories/category.repository'
import { UserRepository } from '@root/repositories/user.repository'

import { BlogRepository } from '@root/repositories/blog.respository'

import { ConversationRepository } from '@root/repositories/conversation.repository'
import { MessageRepository } from '@root/repositories/message.repository'

export const repositories = [
  BookRepository,
  CategoryRepository,
  UserRepository,
  BlogRepository,
  ConversationRepository,
  MessageRepository
]
