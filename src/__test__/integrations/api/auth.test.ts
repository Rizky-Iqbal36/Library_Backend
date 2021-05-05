import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { initServerApp, stopServerApp, flushMongoDB } from '@root/__test__/util/createApp'

// import { SeedUserData } from '@database/seeds/user.seed'
// import { SeedBookData } from '@database/seeds/book.seed'
// import { SeedCategoryData } from '@database/seeds/category.seed'

const url = '/auth'
const body = {
  email: 'coba@email.com',
  password: 'unchunch',
  fullName: 'siapa oii',
  userName: 'oii siapa',
  gender: 'MALE',
  phone: '82290260388',
  address: 'itu di sana'
}
describe(`Authentication`, () => {
  let app: INestApplication
  let server: any
  //   let seedUserData: SeedUserData
  //   let seedBookData: SeedBookData
  //   let seedCategoryData: SeedCategoryData

  beforeAll(async () => {
    app = await initServerApp()
    server = app.getHttpServer()
    // seedUserData = await app.get(SeedUserData)
    // seedBookData = await app.get(SeedBookData)
    // seedCategoryData = await app.get(SeedCategoryData)

    await app.init()
  })

  beforeEach(async () => {
    await flushMongoDB()
  })

  afterAll(async () => {
    await stopServerApp()
  })

  it(`Success => Should register a user and return a token`, async () => {
    const res = await request(server).post(`${url}/register`).send(body)
    expect(res.status).toBe(200)
    expect(res.body.result.data).toHaveProperty('token')
    expect(res.body.result.data.email).toBe(body.email)
  })

  it(`Success => Should login a user and return a token`, async () => {
    await request(server).post(`${url}/register`).send(body)
    const { email, password } = body
    const res = await request(server).post(`${url}/login`).send({ email, password })
    expect(res.status).toBe(200)
    expect(res.body.result.message).toBe('Login success')
    expect(res.body.result.data).toHaveProperty('token')
  })

  it(`Error => login a user should get error: Wrong password or email`, async () => {
    const fakeEmail = 'user@fake.com'
    const res = await request(server).post(`${url}/login`).send({ email: fakeEmail, password: body.password })
    expect(res.status).toBe(400)
    expect(res.body.errors.flag).toBe('EMAIL_OR_PASSWORD_INVALID')

    const fakePassword = 'fakePassword'
    const res1 = await request(server).post(`${url}/login`).send({ email: body.email, password: fakePassword })
    expect(res1.status).toBe(400)
    expect(res1.body.errors.flag).toBe('EMAIL_OR_PASSWORD_INVALID')
  })

  it(`Error => Register a user should get error: Invalid body`, async () => {
    delete body.email
    const res = await request(server).post(`${url}/register`).send(body)
    expect(res.status).toBe(400)
    expect(res.body.errors.flag).toBe('INVALID_BODY')
  })
})
