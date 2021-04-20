import { Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { controllers } from '@root/controller'
import database from '@database/index'
import { repositories } from '@root/repositories'
import { services } from '@root/services/index'
import { HttpExceptionFilter } from '@root/app/exception/http-exception.filter'

@Module({
  imports: [database, repositories],
  controllers,
  providers: [...services, { provide: APP_FILTER, useClass: HttpExceptionFilter }]
})
export class AppModule {}
