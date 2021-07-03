import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { initServerApp, stopServerApp, flushMongoDB } from '@root/__test__/util/createApp'
import { validHeaders } from '@root/__test__/util/set-header'

import { SeedUserData } from '@database/seeds/user.seed'
import { SeedBookData } from '@database/seeds/book.seed'
import { SeedCategoryData } from '@database/seeds/category.seed'
import '@root/__test__/matcher/custom-matcher'

import config from '@root/app/config/appConfig'

const url = '/user'
const header: any = validHeaders

describe(`User API`, () => {
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
    const category = await seedCategoryData.createOne({ name: 'Sci-fi' })
    const book = await seedBookData.createOne({ categoryIds: [category._id] })
    const user = await seedUserData.createOne({ admin: false, bookmarkedBook: [book._id] })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const res = await request(server).get(`${url}/${user.userId}`).set(header).send()

    expect(res.status).toBe(200)
    expect(res.body.result._id).toBe(user.userId.toString())
    expect(res.body.result.bookmarkedBook[0]._id).toBe(book._id.toString())
  })

  it(`Success => User should upload avatar`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const res = await request(server)
      .patch(`${url}/${user.userId}`)
      .set(header)
      .attach('avatar', __dirname + '/file/images/image.jpeg')

    expect(res.status).toBe(200)
    expect(res.body.result.avatar).toBe(
      `${config.cloudinary.assets}/avatars/${user.userId}/avatar-${user.userId}-0.jpg`
    )

    const res1 = await request(server)
      .patch(`${url}/${user.userId}`)
      .set(header)
      .attach('avatar', __dirname + '/file/images/image.jpeg')
    expect(res1.status).toBe(200)
    expect(res1.body.result.avatar).toBe(
      `${config.cloudinary.assets}/avatars/${user.userId}/avatar-${user.userId}-1.jpg`
    )
  })

  it(`Error => Get user data should got error: Invalid param`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const res = await request(server).get(`${url}/0123456789`).set(header).send()
    expect(res.status).toBe(400)
    expect(res.body.errors.message).toBe('INVALID_PARAM')
  })

  it(`Error => Get user data should got error: No such a user`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const res = await request(server).get(`${url}/607ea12bd21e76a4433ea592`).set(header).send()

    expect(res.status).toBe(401)
    expect(res.body.errors.flag).toBe('UNAUTHORIZED')
    expect(res.body.errors.message).toBe("You are not allowed to see other user's data")
  })

  it(`Error => Upload avatar should got error: File too large`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const res = await request(server)
      .patch(`${url}/${user.userId}`)
      .set(header)
      .attach('avatar', __dirname + '/file/images/image-big.jpg')
    expect(res.status).toBe(413)
    expect(res.body.errors.message).toBe('File too large')
  })

  it(`Error => Upload avatar should got error: Invalid file type`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const res = await request(server)
      .patch(`${url}/${user.userId}`)
      .set(header)
      .attach('avatar', __dirname + '/file/docs/image.txt')
    expect(res.status).toBe(400)
    expect(res.body.errors).toMatchObject({
      flag: 'INVALID_FILETYPE',
      message: 'Please select an image file type'
    })
  })

  it(`Error => Upload avatar should got error: User not found`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const res = await request(server)
      .patch(`${url}/607ea12bd21e76a4433ea592`)
      .set(header)
      .attach('avatar', __dirname + '/file/images/image.jpeg')
    expect(res.status).toBe(401)
    expect(res.body.errors.message).toBe("You are not allowed to change other user's data")
  })
})
