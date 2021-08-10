import { Injectable, ExecutionContext } from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'
import { redis } from '@app/utils/redis'
import { TooManyRequestException } from '@app/exception/httpException'
import { httpFlags } from '@root/constant/flags'
import { getLocalizedTime } from '@app/i18n/translation'
import Filter from 'bad-words'
const customFilter = new Filter()

@Injectable()
export class RateThrottlerGuard extends ThrottlerGuard {
  async handleRequest(context: ExecutionContext, limit: number, ttl: number): Promise<boolean> {
    const client = context.switchToHttp().getRequest()
    const lang = client.header('Accept-Language')

    if (customFilter.isProfane(client.body.text)) {
      const banKey = `BAN_MESSAGE_${this.generateKey(context, client.header('x-user-id'))}`
      const banRecord = await redis.client.get(banKey)
      const banRecordCount = parseInt(banRecord) || 0

      if (banRecordCount >= 3) {
        const remainingTime = await redis.client.getRemainingTime(banKey)

        throw new TooManyRequestException(httpFlags.REQUEST_BANNED, {
          localeMessage: { key: 'MESSAGE_REQUEST_BANNED', vars: { time: getLocalizedTime(remainingTime, lang) } }
        })
      }
      await redis.client.set(banKey, (banRecordCount + 1).toString(), { ttlInSec: 5400 })
    }

    const key = `REQUEST_RATE_LIMIT_${this.generateKey(context, client.header('x-user-id'))}`
    const redisRecord = await redis.client.get(key)
    const requestCount = parseInt(redisRecord) || 0

    if (requestCount >= limit) {
      const timeRemaining = await redis.client.getRemainingTime(key)
      throw new TooManyRequestException(httpFlags.TOO_MANY_REQUEST, {
        localeMessage: { key: 'SPAM_MESSAGE', vars: { time: getLocalizedTime(timeRemaining, lang) } }
      })
    }

    await redis.client.set(key, (requestCount + 1).toString(), { ttlInSec: ttl })

    return true
  }
}
