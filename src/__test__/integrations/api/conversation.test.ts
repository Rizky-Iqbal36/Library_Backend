import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { initServerApp, stopServerApp, flushMongoDB } from '@root/__test__/util/createApp'
import { validHeaders } from '@root/__test__/util/set-header'

import { SeedUserData } from '@database/seeds/user.seed'
import { ConversationSeedData } from '@database/seeds/conversation.seed'

import '@root/__test__/matcher/custom-matcher'

const url = '/conversation'
const header: any = validHeaders

describe(`Conversation API`, () => {
  let app: INestApplication
  let server: any
  let seedUserData: SeedUserData
  let conversationSeedData: ConversationSeedData

  beforeAll(async () => {
    app = await initServerApp()
    server = app.getHttpServer()
    seedUserData = await app.get(SeedUserData)
    conversationSeedData = await app.get(ConversationSeedData)
    await app.init()
  })

  beforeEach(async () => {
    await flushMongoDB()
  })

  afterAll(async () => {
    await stopServerApp()
  })

  it(`Success => Should make a conversation`, async () => {
    const users = await seedUserData.createMany(2)
    header['x-user-id'] = users[0].userId
    header['Authorization'] = `Bearer ${users[0].token}`

    const res = await request(server).post(`${url}`).set(header).send({
      senderId: users[0].userId,
      receiverId: users[1].userId
    })

    expect(res.status).toBe(200)
    expect(res.body.result.members).toStrictEqual([users[0].userId.toString(), users[1].userId.toString()])
  })

  it(`Success => Should get a conversation`, async () => {
    const users = await seedUserData.createMany(2)
    header['x-user-id'] = users[0].userId
    header['Authorization'] = `Bearer ${users[0].token}`
    const conversation = await conversationSeedData.createOne({
      senderId: users[0].userId,
      receiverId: users[1].userId
    })

    const res = await request(server).get(`${url}/${users[0].userId}`).set(header).send()
    expect(res.status).toBe(200)
    expect(res.body.result.length).toBe(1)
    expect(res.body.result[0]._id).toBe(conversation._id.toString())
    expect(res.body.result[0].members).toStrictEqual([users[0].userId.toString(), users[1].userId.toString()])
  })
})
