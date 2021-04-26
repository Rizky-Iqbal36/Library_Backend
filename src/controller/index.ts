import { HealthCheckController } from '@root/controller/health-check.controller'
import { BookController } from '@root/controller/api/book.controller'
import { UserController } from '@root/controller/api/user.controller'

export const controllers = [HealthCheckController, BookController, UserController]
