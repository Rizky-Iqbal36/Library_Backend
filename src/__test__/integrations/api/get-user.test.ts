import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { initServerApp, stopServerApp, flushMongoDB } from '@root/__test__/util/createApp'

import { SeedUserData } from '@database/seeds/user.seed'
import { SeedBookData } from '@database/seeds/book.seed'
import { SeedCategoryData } from '@database/seeds/category.seed'

const url = '/user'

describe(`Get user`, () => {
  let app: INestApplication
  let server: any
  let seedUserData: SeedUserData
  let seedBookData: SeedBookData
  let seedCategoryData: SeedCategoryData

  beforeAll(async () => {
    app = await initServerApp()
    server = app.getHttpServer()
    seedUserData = await app.get(SeedUserData)
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

  it(`Success => Should get one user data`, async () => {
    const category = await seedCategoryData.createOne()
    const book = await seedBookData.createOne(category._id)
    const user = await seedUserData.createOne(book._id)
    const res = await request(server).get(`${url}/${user._id}`).send()
    expect(res.status).toBe(200)
    expect(res.body._id).toBe(user._id.toString())
  })

  it(`Success => Should get many user datas`, async () => {
    await seedUserData.createMany(10)
    const res = await request(server).get(url).send().query({ isAdmin: true })
    expect(res.body[0].isAdmin).toBe(true)

    const res1 = await request(server).get(url).send().query({ isAdmin: false })
    expect(res1.body[0].isAdmin).toBe(false)
  })

  it(`Error => Get user data should get error: Invalid param`, async () => {
    const res = await request(server).get(`${url}/200140`).send()
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('INVALID_PARAM')
  })

  it(`Error => Get user data should get error: No such a user`, async () => {
    const res = await request(server).get(`${url}/607ea12bd21e76a4433ea592`).send()
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('USER_NOT_FOUND')
  })
})
