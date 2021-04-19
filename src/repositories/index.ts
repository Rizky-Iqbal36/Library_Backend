import { TypeOrmModule } from '@nestjs/typeorm'
import { BookRepository } from '@root/repositories/book.repository'

export const repositories = TypeOrmModule.forFeature([BookRepository])
