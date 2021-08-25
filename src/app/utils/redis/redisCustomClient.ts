import redis, { ClientOpts, RedisClient } from 'redis'
import { promisify } from 'util'

export class RedisCustomClient {
  public readonly keys = {}

  public client: RedisClient

  constructor(private readonly option: ClientOpts) {
    if (!option.auth_pass) delete option.auth_pass // because if password is undefined or something like that, it's produces error
  }

  public createClient() {
    if (this.client) throw new Error('redis client already created')
    this.client = redis.createClient(this.option)
  }

  public get(key: string) {
    if (!this.client) throw new Error('redis client not created')
    return promisify(this.client.get).apply(this.client, [key])
  }

  public set(
    key: string,
    value: string,
    options?: {
      ttlInSec: number
    }
  ) {
    if (!this.client) throw new Error('redis client not created')
    if (options?.ttlInSec)
      return promisify(this.client.set).apply(this.client, [key, value, 'EX', options.ttlInSec] as any)
    else return promisify(this.client.set).apply(this.client, [key, value])
  }

  public del(key: string) {
    if (!this.client) throw new Error('redis client not created')
    return promisify(this.client.del).apply(this.client, [key])
  }

  public getRemainingTime(key: string) {
    if (!this.client) throw new Error('redis client not created')
    return promisify(this.client.ttl).apply(this.client, [key])
  }

  public verifyConnection = (): Promise<any> => {
    if (!this.client) throw new Error('redis client not created')
    return new Promise((res, rej) => {
      this.client.time((errMsg: any, uptime: any) => (errMsg ? rej(errMsg) : res(uptime)))
    })
  }

  public turnOff = () => {
    if (!this.client) throw new Error('redis client not created')
    return new Promise(res => this.client.quit(res))
  }

  public flushAll = () => {
    if (!this.client) throw new Error('redis client not created')
    return new Promise(res => this.client.flushall(res))
  }

  public flushDb = () => {
    if (!this.client) throw new Error('redis client not created')
    return new Promise(res => this.client.flushdb(res))
  }
}
