import { INestApplication } from '@nestjs/common'
import { initServerApp, stopServerApp, flushMongoDB } from '@root/__test__/util/createApp'
import { io, Socket } from 'socket.io-client'
import { SeedUserData } from '@database/seeds/user.seed'

describe('WebSocketGateway', () => {
  let socket: Socket, app: INestApplication
  let baseSocketAddress: string
  let seedUserData: SeedUserData

  beforeAll(async () => {
    app = await initServerApp()
    seedUserData = await app.get(SeedUserData)

    await app.init()
    const httpServer = await app.getHttpServer().listen().address()
    baseSocketAddress = `http://[${httpServer.address}]:80`
  })

  beforeEach(async () => {
    await flushMongoDB()
  })

  afterAll(async () => {
    await stopServerApp()
  })

  it(`Success => Client should connect to gateway`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    socket = io(`${baseSocketAddress}/chat`, { query: { userId: user.userId.toString() }, transports: ['websocket'] })
    await new Promise<void>(resolve =>
      socket.on('connect', () => {
        expect(socket.connected).toBe(true)
        expect(socket.disconnected).toBe(false)
        socket.disconnect()
        resolve()
      })
    )
  })

  // it(`Success => Many client should connect to gateway`, async () => {
  //   socket = io(`${baseSocketAddress}/chat`, { query: { userId: '1234' }, transports: ['websocket'] })
  //   await new Promise<void>(resolve =>
  //     socket.on('connect', () => {
  //       expect(socket.connected).toBe(true)
  //       expect(socket.disconnected).toBe(false)
  //       socket.disconnect()
  //       resolve()
  //     })
  //   )
  // })
})
