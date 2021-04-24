import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { initServerApp, stopServerApp, flushMongoDB } from '@root/__test__/util/createApp'
import '@root/__test__/matcher/custom-matcher'

import { SeedBookData } from '@database/seeds/book.seed'
import { SeedCategoryData } from '@database/seeds/category.seed'

const url = '/book'

describe(`Get book`, () => {
  let app: INestApplication
  let server: any
  let seedBookData: SeedBookData
  let seedCategoryData: SeedCategoryData

  beforeAll(async () => {
    app = await initServerApp()
    server = app.getHttpServer()
    seedBookData = await app.get(SeedBookData)
    seedCategoryData = await app.get(SeedCategoryData)

    await app.init()
  })

  beforeEach(async () => {
    await flushMongoDB()
  })

  afterAll(async () => {
    await stopServerApp()
  })

  it(`Success => Should get a book`, async () => {
    const category = await seedCategoryData.createOne()
    const book = await seedBookData.createOne(category._id)
    const res = await request(app.getHttpServer()).get(`${url}/${book._id}`).send()

    expect(res.status).toBe(200)
    expect(res.body.isbn).toBe(book.isbn)
    expect(res.body.categoryIds[0].name).toBe(category.name)
    expect(res.body.categoryIds[0]._id).toBe(book.categoryIds[0].toString())
    expect(res.body.views).toBe(book.views + 1)
  })

  it(`Success => Should get many books that sorted by publication`, async () => {
    await seedBookData.createMany(10)
    const res = await request(server).get(url).send()
    expect(res.status).toBe(200)
    expect(res.body.length).toBe(10)
    expect(res.body[0].publication).dateNewerThan(res.body[9].publication)
    expect(res.body[1].publication).not.dateNewerThan(res.body[0].publication)
  })

  it(`Error => Should get error: Invalid param`, async () => {
    const res = await request(server).get(`${url}/20010411`).send()
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('INVALID_PARAM')
  })

  it(`Error => Should get error: No such a book`, async () => {
    const res = await request(app.getHttpServer()).get(`${url}/607ea12bd21e76a4433ea592`).send()
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('BOOK_NOT_FOUND')
  })
})
