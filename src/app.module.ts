import { Module } from '@nestjs/common'
import { controllers } from '@root/controller'
import database from '@database/index'
import { repositories } from '@root/repositories'
import { services } from '@root/services/index'

@Module({
  imports: [database, repositories],
  controllers,
  providers: [...services]
})
export class AppModule {}
