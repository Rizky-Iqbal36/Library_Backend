import { HealthCheckController } from '@root/controller/health-check.controller'
import { BookController } from '@root/controller/api/book.controller'
import { UserController } from '@root/controller/api/user.controller'

import { AuthController } from '@root/authentication/controller/auth.controller'
export const controllers = [HealthCheckController, BookController, UserController, AuthController]
