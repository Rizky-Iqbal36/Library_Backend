import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { initServerApp, stopServerApp, flushMongoDB } from '@root/__test__/util/createApp'
import { validHeaders } from '@root/__test__/util/set-header'

import { SeedUserData } from '@database/seeds/user.seed'
import { SeedBookData } from '@database/seeds/book.seed'
import { SeedCategoryData } from '@database/seeds/category.seed'

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
    const category = await seedCategoryData.createOne({ name: 'Sci-fi' })
    const book = await seedBookData.createOne({ categoryIds: [category._id] })
    category.numberOfBook += 1
    category.books.push(book._id)
    category.save()
    const user = await seedUserData.createOne({ admin: false, bookmarkedBook: [book._id] })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const res = await request(server).get(`${url}/${category._id}`).set(header).send()

    expect(res.status).toBe(200)
    expect(res.body.result).toMatchObject({
      _id: category._id.toString(),
      isActive: category.isActive,
      numberOfBook: 1,
      books: [{ _id: book._id.toString(), categoryIds: [category._id.toString()] }],
      name: category.name,
      description: category.description
    })
  })

  it(`Success => Should get many active categories`, async () => {
    const categories = await seedCategoryData.createMany(10)

    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const res = await request(server).get(`${url}`).set(header).send()

    expect(res.status).toBe(200)
    expect(res.body.result[0]).toMatchObject({
      _id: categories[1]._id.toString(),
      isActive: true,
      numberOfBook: categories[1].numberOfBook,
      name: categories[1].name,
      description: categories[1].description
    })
  })

  it(`Error => Get category should got error: Inactive category`, async () => {
    const category = await seedCategoryData.createOne({ name: 'Sci-fi', index: 0 })
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const res = await request(server).get(`${url}/${category._id}`).set(header).send()

    expect(res.status).toBe(400)
    expect(res.body.errors.message).toBe('CATEGORY_IS_INACTIVE')
  })

  it(`Error => Get category should got error: Category not found`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const res = await request(server).get(`${url}/6096120b0606f97175e26095`).set(header).send()

    expect(res.status).toBe(400)
    expect(res.body.errors.message).toBe('CATEGORY_NOT_FOUND')
  })

  it(`Error => Get category should got error: Invalid param`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const res = await request(server).get(`${url}/0123456789`).set(header).send()

    expect(res.status).toBe(400)
    expect(res.body.errors.message).toBe('INVALID_PARAM')
  })
})
