import { INestApplication } from '@nestjs/common'
import { Connection } from 'typeorm'
import request from 'supertest'
import { initServerApp, stopServerApp } from '@root/__test__/util/createApp'
import { flushMongoDB } from '@database/index'

import { SeedBookData } from '@database/seeds/book.seed'
import { SeedCategoryData } from '@database/seeds/category.seed'

const url = '/book'

describe(`Get book`, () => {
  let app: INestApplication
  let connection: Connection
  let seedBookData: SeedBookData
  let seedCategoryData: SeedCategoryData

  beforeAll(async () => {
    app = await initServerApp()
    seedBookData = await app.get(SeedBookData)
    seedCategoryData = await app.get(SeedCategoryData)
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

  it(`Success => Should get book`, async () => {
    const category = await seedCategoryData.createOne()
    const book = await seedBookData.createOne(category.name)
    const res = await request(app.getHttpServer()).get(`${url}/${book.id}`).send()
    expect(res.status).toBe(200)
    expect(res.body.ISBN).toBe(book.ISBN)
    expect(res.body.category[0]).toBe(category.name)
    expect(res.body.category[0]).toBe(book.category[0])
    expect(res.body.views).toBe(book.views + 1)
  })

  it(`Success => Should get many books`, async () => {
    await seedBookData.createMany(10)
    const res = await request(app.getHttpServer()).get(url).send()
    expect(res.status).toBe(200)
    expect(res.body.length).toBe(10)
  })

  it(`Error => Invalid param`, async () => {
    const res = await request(app.getHttpServer()).get(`${url}/20010411`).send()
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('INVALID_PARAM')
  })
})
