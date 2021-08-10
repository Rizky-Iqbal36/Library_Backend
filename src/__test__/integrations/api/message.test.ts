import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { initServerApp, stopServerApp, flushMongoDB } from '@root/__test__/util/createApp'
import { validHeaders } from '@root/__test__/util/set-header'

import { SeedUserData } from '@database/seeds/user.seed'
import { ConversationSeedData } from '@database/seeds/conversation.seed'
import { MessageSeedData } from '@database/seeds/message.seed'

import '@root/__test__/matcher/custom-matcher'

const url = '/message'
const header: any = validHeaders

describe(`Message API`, () => {
  let app: INestApplication
  let server: any
  let seedUserData: SeedUserData
  let conversationSeedData: ConversationSeedData
  let messageSeedData: MessageSeedData

  beforeAll(async () => {
    app = await initServerApp()
    server = app.getHttpServer()

    seedUserData = await app.get(SeedUserData)
    conversationSeedData = await app.get(ConversationSeedData)
    messageSeedData = await app.get(MessageSeedData)
    await app.init()
  })

  beforeEach(async () => {
    await flushMongoDB()
  })

  afterAll(async () => {
    await stopServerApp()
  })

  it(`Success => Should send a message`, async () => {
    const users = await seedUserData.createMany(2)
    header['x-user-id'] = users[0].userId
    header['Authorization'] = `Bearer ${users[0].token}`
    const conversation = await conversationSeedData.createOne({
      senderId: users[0].userId,
      receiverId: users[1].userId
    })

    const res = await request(server).post(`${url}`).set(header).send({
      conversationId: conversation._id,
      senderId: users[0].userId,
      text: 'Lorem ipsum dolor sit amet'
    })

    expect(res.status).toBe(200)
    expect(res.body.result).toMatchObject({
      conversationId: conversation._id.toString(),
      senderId: users[0].userId.toString(),
      text: 'Lorem ipsum dolor sit amet'
    })
  })

  it(`Success => Should get message`, async () => {
    const users = await seedUserData.createMany(2)
    header['x-user-id'] = users[0].userId
    header['Authorization'] = `Bearer ${users[0].token}`
    const conversation = await conversationSeedData.createOne({
      senderId: users[0].userId,
      receiverId: users[1].userId
    })
    const userOneMessage = await messageSeedData.createOne({
      conversationId: conversation._id,
      senderId: users[0].userId,
      text: 'Is that it?'
    })
    const userTwoMessage = await messageSeedData.createOne({
      conversationId: conversation._id,
      senderId: users[1].userId,
      text: 'Yup!'
    })

    const res = await request(server).get(`${url}/${conversation._id}`).set(header).send()

    expect(res.status).toBe(200)
    expect(res.body.result.length).toBe(2)
    expect(res.body).toMatchObject({
      result: [
        {
          _id: userOneMessage._id.toString(),
          senderId: users[0].userId.toString(),
          text: 'Is that it?'
        },
        {
          _id: userTwoMessage._id.toString(),
          senderId: users[1].userId.toString(),
          text: 'Yup!'
        }
      ]
    })
  })

  it(`Error => Too much request`, async () => {
    const users = await seedUserData.createMany(2)
    header['x-user-id'] = users[0].userId
    header['Authorization'] = `Bearer ${users[0].token}`
    const conversation = await conversationSeedData.createOne({
      senderId: users[0].userId,
      receiverId: users[1].userId
    })

    for (let i = 0; i < 30; i++) {
      await request(server).post(`${url}`).set(header).send({
        conversationId: conversation._id,
        senderId: users[0].userId,
        text: 'Lorem ipsum dolor sit amet'
      })
    }
    const res = await request(server).post(`${url}`).set(header).send({
      conversationId: conversation._id,
      senderId: users[0].userId,
      text: 'consectetur adipiscing elit'
    })
    expect(res.status).toBe(429)
    expect(res.body.errors.flag).toBe('TOO_MANY_REQUEST')
  })
})
