import { Module, MiddlewareConsumer } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { controllers } from '@root/controller'
import { databaseProviders } from '@database/index'
import { repositories } from '@root/repositories'
import { services } from '@root/services/index'
import { HttpExceptionFilter } from '@root/app/exception/http-exception.filter'
import ResponseInterceptor from '@root/app/utils/interceptor/response.interceptor'

import { UserMiddleware } from '@app/middlewares/user.middleware'
import { UserAuthMiddleware } from '@root/authentication/middleware/auth.middleware'

import { BookController } from '@root/controller/api/book.controller'
import { UserController } from '@root/controller/api/user.controller'
import { CategoryController } from '@root/controller/api/category.controller'
@Module({
  controllers,
  providers: [
    ...databaseProviders,
    ...repositories,
    ...services,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor }
  ]
})
export class AppModule {
  async configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserAuthMiddleware, UserMiddleware).forRoutes(CategoryController, BookController, UserController)
  }
}
