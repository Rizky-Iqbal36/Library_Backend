import { TypeOrmModule } from '@nestjs/typeorm'
import { BookRepository } from '@root/repositories/book.repository'
import { CategoryRepository } from '@root/repositories/category.repository'

export const repositories = TypeOrmModule.forFeature([BookRepository, CategoryRepository])
