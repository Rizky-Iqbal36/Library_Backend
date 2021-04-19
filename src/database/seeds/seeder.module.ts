import { Module } from '@nestjs/common'
import database from '@database/index'
import { repositories } from '@root/repositories/index'
import Seeds, { seedFiles } from '@database/seeds'

@Module({
  imports: [database, repositories],
  providers: [Seeds, ...seedFiles]
})
export class SeederModule {}
