import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { initServerApp, stopServerApp, flushMongoDB } from '@root/__test__/util/createApp'
import { validHeaders } from '@root/__test__/util/set-header'

const header: any = validHeaders
const url = '/auth'
let payload: any
describe(`Authentication API`, () => {
  let app: INestApplication
  let server: any

  beforeAll(async () => {
    app = await initServerApp()
    server = app.getHttpServer()

    await app.init()
  })

  beforeEach(async () => {
    payload = {
      email: 'coba@email.com',
      password: 'unchunch',
      userName: 'magicUser'
    }
    await flushMongoDB()
  })

  afterAll(async () => {
    await stopServerApp()
  })

  it(`Success => Should register a user and return a token`, async () => {
    const res = await request(server).post(`${url}/register`).set(header).send(payload)
    expect(res.status).toBe(200)
    expect(res.body.result.data).toHaveProperty('token')
    expect(res.body.result.data.email).toBe(payload.email)
  })

  it(`Success => Should login a user and return a token`, async () => {
    await request(server).post(`${url}/register`).set(header).send(payload)
    const { email, password } = payload
    const res = await request(server).post(`${url}/login`).set(header).send({ email, password })
    expect(res.status).toBe(200)
    expect(res.body.result.message).toBe('Login success')
    expect(res.body.result.data).toHaveProperty('token')
  })

  it(`Error => login a user should got error: Wrong password or email`, async () => {
    await request(server).post(`${url}/register`).set(header).send(payload)

    const fakeEmail = 'user@fake.com'
    const res = await request(server)
      .post(`${url}/login`)
      .set(header)
      .send({ email: fakeEmail, password: payload.password })
    expect(res.status).toBe(400)
    expect(res.body.errors.flag).toBe('EMAIL_OR_PASSWORD_INVALID')

    const fakePassword = 'fakePassword'
    const res1 = await request(server)
      .post(`${url}/login`)
      .set(header)
      .send({ email: payload.email, password: fakePassword })
    expect(res1.status).toBe(400)
    expect(res1.body.errors.flag).toBe('EMAIL_OR_PASSWORD_INVALID')
  })

  it(`Error => Register a user should got error: Email already exist`, async () => {
    await request(server).post(`${url}/register`).set(header).send(payload)
    const res = await request(server).post(`${url}/register`).set(header).send(payload)
    expect(res.status).toBe(400)
    expect(res.body.errors.flag).toBe('EMAIL_ALREADY_EXIST')
  })

  it(`Error => User access API should got error: User unauthorized`, async () => {
    const registerUser = await request(server).post(`${url}/register`).set(header).send(payload)
    const registeredUser = registerUser.body.result.data
    header['x-user-id'] = registeredUser.userId

    const res = await request(app.getHttpServer())
      .get(`/book/607ea12c821e76a4433ea592`)
      .set(header)
      .send()
      .query({ bookmark: 'UWAUW' })
    expect(res.status).toBe(401)
    expect(res.body.errors.flag).toBe('USER_UNAUTHORIZED')
  })

  it(`Error => User access API should got error: Invalid token`, async () => {
    const registerUser = await request(server).post(`${url}/register`).set(header).send(payload)
    const registeredUser = registerUser.body.result.data
    header['x-user-id'] = registeredUser.userId
    header[
      'Authorization'
    ] = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwOGJhNzQ3MzE1YTgwMzA1NGEwZTJiNSIsImlhdCI6MTYxOTc2NTA5MCwiZXhwIjoxNjE5ODUxNDkwfQ.bv9Hwp4IAdLAktBa8BL4TFBpE2yWu5t8lCPKfeCVe0k`

    const res = await request(app.getHttpServer())
      .get(`/book/607ea12bd21e76a4433ea592`)
      .set(header)
      .send()
      .query({ bookmark: 'UWAUW' })
    expect(res.status).toBe(400)
    expect(res.body.errors.flag).toBe('INVALID_TOKEN')
  })

  it(`Error => Register a user should got error: Invalid body`, async () => {
    delete payload.email
    const res = await request(server).post(`${url}/register`).set(header).send(payload)
    expect(res.status).toBe(400)
    expect(res.body.errors.flag).toBe('INVALID_BODY')
  })
})
