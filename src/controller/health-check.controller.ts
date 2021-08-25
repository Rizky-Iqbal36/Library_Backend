import { Controller, Get } from '@nestjs/common'
import { redis } from '@app/utils/redis'
import appConfig from '@root/app/config/appConfig'
import moment from 'moment'
import 'moment-duration-format'

@Controller('health')
export class HealthCheckController {
  @Get()
  async get() {
    let redisStatus = 'UP'
    await redis.client.verifyConnection().catch(() => {
      redisStatus = 'DOWN'
    })
    return {
      name: appConfig.app.name,
      version: appConfig.app.version,
      websokcetPort: appConfig.app.websocketPort,
      redis: redisStatus,
      environment: process.env.NODE_ENV,
      uptime: moment.duration(process.uptime(), 'seconds').format('h [hrs] : m [min] : s [sec]', { trim: false })
    }
  }
}
