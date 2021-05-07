import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { initServerApp, stopServerApp, flushMongoDB } from '@root/__test__/util/createApp'
import { validHeaders } from '@root/__test__/util/set-header'

import { SeedUserData } from '@database/seeds/user.seed'
import { SeedBookData } from '@database/seeds/book.seed'
import { SeedCategoryData } from '@database/seeds/category.seed'

const createUserUrl = '/auth/register'
const url = '/category'
const header: any = validHeaders

describe(`Category API`, () => {
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

  it(`Success => Should get one category`, async () => {
    const category = await seedCategoryData.createOne()
    const book = await seedBookData.createOne(category._id)
    category.numberOfBook += 1
    category.books.push(book._id)
    category.save()
    const userData = await seedUserData.createOne([book._id])
    const registerUser = await request(server).post(`${createUserUrl}`).send(userData)
    const registeredUser = registerUser.body.result.data
    header['x-user-id'] = registeredUser.userId
    header['Authorization'] = `Bearer ${registeredUser.token}`

    const res = await request(server).get(`${url}/${category._id}`).set(header).send()
    expect(res.status).toBe(200)
    expect(res.body.result).toMatchObject({
      _id: category._id.toString(),
      isActive: true,
      numberOfBook: 1,
      books: [book._id.toString()],
      name: category.name,
      description: category.description
    })
  })
})
