import { Module } from '@nestjs/common'
import { databaseProviders } from '@database/index'
import { repositories } from '@root/repositories/index'
import Seeds, { seedFiles } from '@database/seeds'

@Module({
  providers: [...databaseProviders, ...repositories, Seeds, ...seedFiles]
})
export class SeederModule {}
