import config from '@app/config/appConfig'
import { RedisCustomClient } from './redisCustomClient'

class Redis {
  public readonly client = new RedisCustomClient(config.redis)
  public keys = {
    REQUEST_RATE_LIMIT: (key: string) => `REQUEST_RATE_LIMIT_${key}`
  }
}
export const redis = new Redis()
