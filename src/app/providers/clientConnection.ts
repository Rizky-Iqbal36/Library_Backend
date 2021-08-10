import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { redis } from '@app/utils/redis'

@Injectable()
export class ClientConnections implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    redis.client.createClient()
  }

  async onModuleDestroy() {
    await redis.client.turnOff()
  }
}
