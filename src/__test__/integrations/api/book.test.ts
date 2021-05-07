import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { initServerApp, stopServerApp, flushMongoDB } from '@root/__test__/util/createApp'
import { validHeaders } from '@root/__test__/util/set-header'
import '@root/__test__/matcher/custom-matcher'

import { SeedBookData } from '@database/seeds/book.seed'
import { SeedUserData } from '@database/seeds/user.seed'
import { SeedCategoryData } from '@database/seeds/category.seed'

const createUserUrl = '/auth/register'
const url = '/book'
const header: any = validHeaders

describe(`Get book`, () => {
  let app: INestApplication
  let server: any
  let seedBookData: SeedBookData
  let seedUserData: SeedUserData
  let seedCategoryData: SeedCategoryData

  beforeAll(async () => {
    app = await initServerApp()
    server = app.getHttpServer()
    seedBookData = await app.get(SeedBookData)
    seedUserData = await app.get(SeedUserData)
    seedCategoryData = await app.get(SeedCategoryData)

    await app.init()
  })

  beforeEach(async () => {
    await flushMongoDB()
  })

  afterAll(async () => {
    await stopServerApp()
  })

  it(`Success => User should get a book`, async () => {
    const userData = await seedUserData.createOne()
    const registerUser = await request(server).post(`${createUserUrl}`).send(userData)
    const registeredUser = registerUser.body.result.data
    header['x-user-id'] = registeredUser.userId
    header['Authorization'] = `Bearer ${registeredUser.token}`

    const category = await seedCategoryData.createOne()
    const book = await seedBookData.createOne(category._id)
    const res = await request(app.getHttpServer()).get(`${url}/${book._id}`).set(header).send()
    expect(res.status).toBe(200)
    expect(res.body.result.isbn).toBe(book.isbn)
    expect(res.body.result.categoryIds[0].name).toBe(category.name)
    expect(res.body.result.categoryIds[0]._id).toBe(book.categoryIds[0].toString())
    expect(res.body.result.views).toBe(book.views + 1)
  })

  it(`Success => User should bookmark and unbookmark a book`, async () => {
    const userData = await seedUserData.createOne()
    const registerUser = await request(server).post(`${createUserUrl}`).send(userData)
    const registeredUser = registerUser.body.result.data
    header['x-user-id'] = registeredUser.userId
    header['Authorization'] = `Bearer ${registeredUser.token}`

    const category = await seedCategoryData.createOne()
    const book = await seedBookData.createOne(category._id)

    const gotUser = await request(server).get(`/user/${registeredUser.userId}`).set(header).send()
    expect(gotUser.body.result.bookmarkedBook.length).toBe(0)
    expect(gotUser.body.result.totalBookmarked).toBe(0)

    const res = await request(app.getHttpServer())
      .get(`${url}/${book._id}`)
      .set(header)
      .send()
      .query({ bookmark: 'BOOKMARK' })
    expect(res.status).toBe(200)
    expect(res.body.result.bookMarked).toBe(1)

    const updatedUser = await request(server).get(`/user/${registeredUser.userId}`).set(header).send()
    expect(updatedUser.body.result.bookmarkedBook.length).toBe(1)
    expect(updatedUser.body.result.totalBookmarked).toBe(1)
    expect(res.body.result.bookMarkedBy[0]).toBe(registeredUser.userId.toString())
    expect(updatedUser.body.result.bookmarkedBook[0]._id).toBe(book._id.toString())

    const res1 = await request(app.getHttpServer())
      .get(`${url}/${book._id}`)
      .set(header)
      .send()
      .query({ bookmark: 'UNBOOKMARK' })
    expect(res1.status).toBe(200)
    expect(res1.body.result.bookMarked).toBe(0)

    const updatedUser1 = await request(server).get(`/user/${registeredUser.userId}`).set(header).send()
    expect(updatedUser1.body.result.bookmarkedBook.length).toBe(0)
    expect(updatedUser1.body.result.totalBookmarked).toBe(0)
  })

  it(`Success => User should get many books that sorted by most recent publication date`, async () => {
    const userData = await seedUserData.createOne()
    const registerUser = await request(server).post(`${createUserUrl}`).send(userData)
    const registeredUser = registerUser.body.result.data
    header['x-user-id'] = registeredUser.userId
    header['Authorization'] = `Bearer ${registeredUser.token}`

    await seedBookData.createMany(10)
    const res = await request(server).get(url).set(header).send()
    expect(res.status).toBe(200)
    expect(res.body.result.length).toBe(10)
    expect(res.body.result[0].publication).dateNewerThan(res.body.result[9].publication)
    expect(res.body.result[1].publication).not.dateNewerThan(res.body.result[0].publication)
  })

  it(`Error => Get book should get error: Invalid param`, async () => {
    const userData = await seedUserData.createOne()
    const registerUser = await request(server).post(`${createUserUrl}`).send(userData)
    const registeredUser = registerUser.body.result.data
    header['x-user-id'] = registeredUser.userId
    header['Authorization'] = `Bearer ${registeredUser.token}`

    const res = await request(server).get(`${url}/20010411`).set(header).send()
    expect(res.status).toBe(400)
    expect(res.body.errors.message).toBe('INVALID_PARAM')
  })

  it(`Error => Get Book Should get error: No such a book`, async () => {
    const userData = await seedUserData.createOne()
    const registerUser = await request(server).post(`${createUserUrl}`).send(userData)
    const registeredUser = registerUser.body.result.data
    header['x-user-id'] = registeredUser.userId
    header['Authorization'] = `Bearer ${registeredUser.token}`

    const res = await request(app.getHttpServer()).get(`${url}/607ea12bd21e76a4433ea592`).set(header).send()
    expect(res.status).toBe(400)
    expect(res.body.errors.message).toBe('BOOK_NOT_FOUND')
  })

  it(`Error => Bookmark a book should get error: Invalid param`, async () => {
    const userData = await seedUserData.createOne()
    const registerUser = await request(server).post(`${createUserUrl}`).send(userData)
    const registeredUser = registerUser.body.result.data
    header['x-user-id'] = registeredUser.userId
    header['Authorization'] = `Bearer ${registeredUser.token}`

    const category = await seedCategoryData.createOne()
    const book = await seedBookData.createOne(category._id)
    const res = await request(app.getHttpServer())
      .get(`${url}/${book._id}`)
      .set(header)
      .send()
      .query({ bookmark: 'UWAUW' })
    expect(res.status).toBe(400)
    expect(res.body.errors.message).toBe('INVALID_PARAM')
  })
})
