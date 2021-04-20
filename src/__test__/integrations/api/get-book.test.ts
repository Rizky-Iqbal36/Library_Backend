import { INestApplication } from '@nestjs/common'
import { Connection } from 'typeorm'
import request from 'supertest'
import { initServerApp, stopServerApp } from '@root/__test__/util/createApp'
import { BookDataSeed } from '@database/seeds/book.seed'
import { flushMongoDB } from '@database/index'

const url = '/book'

describe(`Get book`, () => {
  let app: INestApplication
  let connection: Connection
  let bookDataSeed: BookDataSeed

  beforeAll(async () => {
    app = await initServerApp()
    bookDataSeed = await app.get(BookDataSeed)
    connection = await app.get(Connection)

    await app.init()
  })

  beforeEach(async () => {
    await flushMongoDB()
  })

  afterAll(async () => {
    await connection.synchronize(true)
    await stopServerApp()
  })

  it(`Should get book`, async () => {
    const book = await bookDataSeed.createOne()
    const res = await request(app.getHttpServer()).get(url).send()
    expect(res.status).toBe(200)
    expect(res.body[0].ISBN).toBe(book.ISBN)
  })

  it(`Should get many books`, async () => {
    await bookDataSeed.createMany(10)
    const res = await request(app.getHttpServer()).get(url).send()
    expect(res.status).toBe(200)
    expect(res.body.length).toBe(10)
  })
})
