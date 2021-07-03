import { HealthCheckController } from '@root/controller/health-check.controller'

import { AdminController } from '@root/controller/api/admin.controller'
import { UserController } from '@root/controller/api/user.controller'

import { BookController } from '@root/controller/api/book.controller'
import { CategoryController } from '@root/controller/api/category.controller'

import { AuthController } from '@root/authentication/controller/auth.controller'
export const controllers = [
  HealthCheckController,
  AdminController,
  BookController,
  UserController,
  AuthController,
  CategoryController
]
