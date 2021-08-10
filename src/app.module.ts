import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { controllers } from '@root/controller'
import { databaseProviders } from '@database/index'
import { repositories } from '@root/repositories'
import { services } from '@root/services/index'
import { ChattingGateway } from '@root/events/chatting.event'

import { ClientConnections } from '@app/providers/clientConnection'
import { HttpExceptionFilter } from '@app/exception/http-exception.filter'
import ResponseInterceptor from '@app/utils/interceptor/response.interceptor'

import { HeaderMiddleware } from '@app/middlewares/header.middleware'
import { UserMiddleware } from '@app/middlewares/user.middleware'
import { UserAuthMiddleware } from '@root/authentication/middleware/auth.middleware'

import { BookController } from '@root/controller/api/book.controller'
import { UserController } from '@root/controller/api/user.controller'
import { CategoryController } from '@root/controller/api/category.controller'
@Module({
  controllers,
  providers: [
    ClientConnections,
    ChattingGateway,
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
    consumer
      .apply(HeaderMiddleware)
      .exclude({ path: 'health', method: RequestMethod.ALL })
      .forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}
