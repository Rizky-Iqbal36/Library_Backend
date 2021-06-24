import { Module } from '@nestjs/common'
import { databaseProviders } from '@database/index'
import { repositories } from '@root/repositories/index'
import { services } from '@root/services'
import Seeds, { seedFiles } from '@database/seeds'

@Module({
  providers: [Seeds, ...databaseProviders, ...repositories, ...services, ...seedFiles]
})
export class SeederModule {}
