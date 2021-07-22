import { INestApplication } from '@nestjs/common'
import { initServerApp, stopServerApp, flushMongoDB } from '@root/__test__/util/createApp'
import { io, Socket } from 'socket.io-client'
import { SeedUserData } from '@database/seeds/user.seed'

describe('Messaging Event', () => {
  let senderSocket: Socket, receiverSocket: Socket, app: INestApplication
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

  it(`Success => Messaging`, async () => {
    const sender = await seedUserData.createOne({ admin: false })
    const receiver = await seedUserData.createOne({ admin: false })
    senderSocket = io(`${baseSocketAddress}/chat`, {
      query: { userId: sender.userId.toString() },
      transports: ['websocket']
    })
    receiverSocket = io(`${baseSocketAddress}/chat`, {
      query: { userId: receiver.userId.toString() },
      transports: ['websocket']
    })

    senderSocket.emit('sendMessage', {
      senderId: sender.userId,
      receiverId: receiver.userId,
      text: 'X-potato'
    })

    await new Promise<void>(resolve =>
      receiverSocket.on('getMessage', payload => {
        expect(payload).toMatchObject({
          senderId: sender.userId.toString(),
          text: 'X-potato'
        })
        senderSocket.disconnect()
        receiverSocket.disconnect()
        resolve()
      })
    )
  })
})
