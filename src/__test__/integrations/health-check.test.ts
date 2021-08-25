import { INestApplication } from '@nestjs/common'
import { initServerApp, stopServerApp } from '@root/__test__/util/createApp'
import appConfig from '@root/app/config/appConfig'
import request from 'supertest'

describe('Health check API', () => {
  let app: INestApplication
  let server: any

  beforeAll(async () => {
    app = await initServerApp()
    server = app.getHttpServer()
    await app.init()
  })

  afterAll(async () => await stopServerApp())

  it('Success => Should hit health check endpoint', async () => {
    const res = await request(server).get('/health')

    expect(res.status).toBe(200)
    expect(res.body.result).toMatchObject({
      name: appConfig.app.name,
      version: appConfig.app.version,
      websokcetPort: appConfig.app.websocketPort,
      redis: 'UP'
    })
  })
})
