import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { initServerApp, stopServerApp, flushMongoDB } from '@root/__test__/util/createApp'
import { validHeaders } from '@root/__test__/util/set-header'

import { SeedUserData } from '@database/seeds/user.seed'
import { SeedBookData } from '@database/seeds/book.seed'
import { SeedCategoryData } from '@database/seeds/category.seed'

import config from '@root/app/config/appConfig'

const createUserUrl = '/auth/register'
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
    console.log(config.cloudinary)
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
    const book = await seedBookData.createOne(category._id)
    const userData = await seedUserData.createOne([book._id])
    const registerUser = await request(server).post(`${createUserUrl}`).send(userData)
    const registeredUser = registerUser.body.result.data
    header['x-user-id'] = registeredUser.userId
    header['Authorization'] = `Bearer ${registeredUser.token}`

    const res = await request(server).get(`${url}/${registeredUser.userId}`).set(header).send()
    expect(res.status).toBe(200)
    expect(res.body.result._id).toBe(registeredUser.userId)
  })

  it(`Success => Should get many user datas that sorted by admin property`, async () => {
    let userData: any
    let registerUser: request.Response
    for (let i = 0; i < 10; i++) {
      userData = await seedUserData.createOne()
      if (i === 9) userData.isAdmin = true
      registerUser = await request(server).post(`${createUserUrl}`).send(userData)
    }

    const registeredUser = registerUser.body.result.data
    header['x-user-id'] = registeredUser.userId
    header['Authorization'] = `Bearer ${registeredUser.token}`

    const res = await request(server).get(url).set(header).send().query({ isAdmin: true })

    expect(res.body.result[0].isAdmin).toBe(true)

    const res1 = await request(server).get(url).set(header).query({ isAdmin: false })
    expect(res1.body.result[0].isAdmin).toBe(false)
  })

  it(`Success => Should get many user datas without query`, async () => {
    let userData: any
    let registerUser: request.Response
    for (let i = 0; i < 10; i++) {
      userData = await seedUserData.createOne()
      if (i === 9) userData.isAdmin = true
      registerUser = await request(server).post(`${createUserUrl}`).send(userData)
    }
    const registeredUser = registerUser.body.result.data
    header['x-user-id'] = registeredUser.userId
    header['Authorization'] = `Bearer ${registeredUser.token}`

    const res = await request(server).get(url).set(header).send()
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('result')
    expect(res.body.result.length).toBe(10)
  })

  it(`Success => User should upload avatar`, async () => {
    const userData = await seedUserData.createOne()
    const registerUser = await request(server).post(`${createUserUrl}`).send(userData)
    const registeredUser = registerUser.body.result.data
    header['x-user-id'] = registeredUser.userId
    header['Authorization'] = `Bearer ${registeredUser.token}`

    const res = await request(server)
      .patch(`${url}/${registeredUser.userId}`)
      .set(header)
      .attach('avatar', __dirname + '/file/image.jpeg')

    expect(res.status).toBe(200)
    expect(res.body.result.avatar).toBe(`${config.cloudinary}/avatars/avatar-${registeredUser.userId}.jpg`)
  })

  it(`Error => Get many user datas should got error: User is not admin`, async () => {
    const userData = await seedUserData.createOne()
    userData.isAdmin = false
    const registerUser = await request(server).post(`${createUserUrl}`).send(userData)
    const registeredUser = registerUser.body.result.data
    header['x-user-id'] = registeredUser.userId
    header['Authorization'] = `Bearer ${registeredUser.token}`

    const res = await request(server).get(url).set(header).send()
    expect(res.status).toBe(401)
    expect(res.body.errors.flag).toBe('USER_UNAUTHORIZED')
  })

  it(`Error => Get user data should got error: Invalid param`, async () => {
    const userData = await seedUserData.createOne()
    const registerUser = await request(server).post(`${createUserUrl}`).send(userData)
    const registeredUser = registerUser.body.result.data
    header['x-user-id'] = registeredUser.userId
    header['Authorization'] = `Bearer ${registeredUser.token}`
    const res = await request(server).get(`${url}/0123456789`).set(header).send()
    expect(res.status).toBe(400)
    expect(res.body.errors.message).toBe('INVALID_PARAM')
  })

  it(`Error => Get user data should got error: No such a user`, async () => {
    const userData = await seedUserData.createOne()
    const registerUser = await request(server).post(`${createUserUrl}`).send(userData)
    const registeredUser = registerUser.body.result.data
    header['x-user-id'] = registeredUser.userId
    header['Authorization'] = `Bearer ${registeredUser.token}`

    const res = await request(server).get(`${url}/607ea12bd21e76a4433ea592`).set(header).send()
    expect(res.status).toBe(400)
    expect(res.body.errors.message).toBe('USER_NOT_FOUND')
  })

  it(`Error => Upload avatar should got error: File too large`, async () => {
    const userData = await seedUserData.createOne()
    const registerUser = await request(server).post(`${createUserUrl}`).send(userData)
    const registeredUser = registerUser.body.result.data
    header['x-user-id'] = registeredUser.userId
    header['Authorization'] = `Bearer ${registeredUser.token}`

    const res = await request(server)
      .patch(`${url}/${registeredUser.userId}`)
      .set(header)
      .attach('avatar', __dirname + '/file/image-big.jpg')

    expect(res.status).toBe(413)
    expect(res.body.errors.message).toBe('File too large')
  })

  it(`Error => Upload avatar should got error: Invalid file type`, async () => {
    const userData = await seedUserData.createOne()
    const registerUser = await request(server).post(`${createUserUrl}`).send(userData)
    const registeredUser = registerUser.body.result.data
    header['x-user-id'] = registeredUser.userId
    header['Authorization'] = `Bearer ${registeredUser.token}`

    const res = await request(server)
      .patch(`${url}/${registeredUser.userId}`)
      .set(header)
      .attach('avatar', __dirname + '/file/image.txt')
    expect(res.status).toBe(400)
    expect(res.body.errors).toMatchObject({
      flag: 'INVALID_FILETYPE',
      message: 'Please select an image file type'
    })
  })

  it(`Error => Upload avatar should got error: User not found`, async () => {
    const userData = await seedUserData.createOne()
    const registerUser = await request(server).post(`${createUserUrl}`).send(userData)
    const registeredUser = registerUser.body.result.data
    header['x-user-id'] = registeredUser.userId
    header['Authorization'] = `Bearer ${registeredUser.token}`

    const res = await request(server)
      .patch(`${url}/607ea12bd21e76a4433ea592`)
      .set(header)
      .attach('avatar', __dirname + '/file/image.jpeg')
    expect(res.status).toBe(400)
    expect(res.body.errors.message).toBe('USER_NOT_FOUND')
  })
})
