import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { initServerApp, stopServerApp, flushMongoDB } from '@root/__test__/util/createApp'
import { validHeaders } from '@root/__test__/util/set-header'
import { UserStatusEnum, BookStatusEnum } from '@root/interfaces/enum'

import { SeedBookData } from '@database/seeds/book.seed'
import { SeedUserData } from '@database/seeds/user.seed'
import { SeedCategoryData } from '@database/seeds/category.seed'

import { CategoryRepository } from '@root/repositories/category.repository'
import { UserRepository } from '@root/repositories/user.repository'

import '@root/__test__/matcher/custom-matcher'

const header: any = validHeaders
const url = '/admin'

describe(`Admin API`, () => {
  let app: INestApplication
  let server: any

  let seedBookData: SeedBookData
  let seedUserData: SeedUserData
  let seedCategoryData: SeedCategoryData

  let categoryRepository: CategoryRepository
  let userRepository: UserRepository

  beforeAll(async () => {
    app = await initServerApp()
    server = app.getHttpServer()
    seedUserData = await app.get(SeedUserData)

    seedBookData = await app.get(SeedBookData)
    seedUserData = await app.get(SeedUserData)
    seedCategoryData = await app.get(SeedCategoryData)

    categoryRepository = await app.get(CategoryRepository)
    userRepository = await app.get(UserRepository)

    await app.init()
  })

  beforeEach(async () => {
    await flushMongoDB()
  })

  afterAll(async () => {
    await stopServerApp()
  })

  it(`Success => Should get many user datas and pagination should work properly`, async () => {
    const admin = await seedUserData.createOne({ admin: true })
    await seedUserData.createMany(14)
    header['x-user-id'] = admin.userId
    header['Authorization'] = `Bearer ${admin.token}`

    const res = await request(server).get(`${url}/get-users`).set(header).send()

    expect(res.status).toBe(200)
    expect(res.body.result.currentPage).toBe(1)
    expect(res.body.result.totalPage).toBe(2)
    expect(res.body.result.totalBookOnThisPage).toBe(res.body.result.data.length)
    expect(res.body.result.data[0].createdAt).dateNewerThan(res.body.result.data[9].createdAt)
    expect(res.body.result.data[1].createdAt).not.dateNewerThan(res.body.result.data[0].createdAt)

    const res2 = await request(server).get(`${url}/get-users`).set(header).query({ page: 2 }).send()
    expect(res2.status).toBe(200)
    expect(res2.body.result.currentPage).toBe(2)
    expect(res2.body.result.totalPage).toBe(2)
    expect(res2.body.result.totalBookOnThisPage).toBe(5)
    expect(res2.body.result.data[0].createdAt).dateNewerThan(res2.body.result.data[4].createdAt)
    expect(res2.body.result.data[1].createdAt).not.dateNewerThan(res2.body.result.data[0].createdAt)

    expect(res.body.result.data[9].createdAt).dateNewerThan(res2.body.result.data[0].createdAt)
  })

  it(`Success => Should get a user`, async () => {
    const admin = await seedUserData.createOne({ admin: true })
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = admin.userId
    header['Authorization'] = `Bearer ${admin.token}`

    const res = await request(server).get(`${url}/get-user/${user.userId}`).set(header).send()

    expect(res.status).toBe(200)
    expect(res.body.result._id).toBe(user.userId.toString())
  })

  it(`Success => Should delete a user`, async () => {
    const user = await seedUserData.createOne({ admin: false })

    let getUsers = await userRepository.getAllUsers({ options: { skip: 0, take: 10 } })
    expect(getUsers.length).toBe(1)
    expect(user).toMatchObject({
      userId: getUsers[0]._id,
      email: getUsers[0].email
    })

    const admin = await seedUserData.createOne({ admin: true })

    header['x-user-id'] = admin.userId
    header['Authorization'] = `Bearer ${admin.token}`
    const res = await request(server).delete(`${url}/${user.userId}`).set(header).send()
    expect(res.status).toBe(200)
    expect(res.body.result.message).toBe(`User with id: ${user.userId} has successfully deleted`)

    getUsers = await userRepository.getAllUsers({ options: { skip: 0, take: 10 } })
    expect(getUsers.length).toBe(1)
    expect(admin).toMatchObject({
      userId: getUsers[0]._id,
      email: getUsers[0].email
    })
  })

  it(`Success => Should block and unblocking a user`, async () => {
    const user = await seedUserData.createOne({ admin: false })

    let getUser = await userRepository.getOneUser(user.userId)
    expect(getUser.isActive).toBe(true)
    expect(getUser.status).toBe(UserStatusEnum.ACTIVE)
    expect(user).toMatchObject({
      userId: getUser._id,
      email: getUser.email
    })

    const admin = await seedUserData.createOne({ admin: true })

    header['x-user-id'] = admin.userId
    header['Authorization'] = `Bearer ${admin.token}`

    const res = await request(server)
      .patch(`${url}/${user.userId}`)
      .set(header)
      .query({ setActive: false, setStatus: UserStatusEnum.BLOCKED })
      .send()
    expect(res.status).toBe(200)

    getUser = await userRepository.getOneUser(user.userId)
    expect(getUser.isActive).toBe(false)
    expect(getUser.status).toBe(UserStatusEnum.BLOCKED)

    await request(server)
      .patch(`${url}/${user.userId}`)
      .set(header)
      .query({ setActive: true, setStatus: UserStatusEnum.ACTIVE })
      .send()

    getUser = await userRepository.getOneUser(user.userId)
    expect(getUser.isActive).toBe(true)
    expect(getUser.status).toBe(UserStatusEnum.ACTIVE)
  })

  it(`Success => User should update a book and book approval functionality should work properly`, async () => {
    const payload = {
      title: 'Harry Potter and the Goblet of Fire',
      authors: ['J.K Rowling'],
      categoryIds: [],
      publication: '8 Juli 2000',
      pages: 882,
      aboutBook: "Harry Potter and the Goblet of Fire is the fourth book in J. K. Rowling's Harry Potter novel series"
    }

    const userData = await seedUserData.createOne({ admin: false })

    header['x-user-id'] = userData.userId
    header['Authorization'] = `Bearer ${userData.token}`

    const category = await seedCategoryData.createOne({ name: 'Sci-fi' })
    const book = await seedBookData.createOne({ uploadBy: userData.userId, categoryIds: [`${category._id}`] })
    const category1 = await seedCategoryData.createOne({ name: 'Magic' })

    payload.title = 'Stardenburdenhardenbart'
    payload.categoryIds.push(category1._id)

    const res = await request(server).put(`/book/${book._id}`).set(header).send(payload)

    expect(res.status).toBe(200)
    expect(res.body.result.uploadBy).toBe(userData.userId.toString())
    expect(res.body.result.categoryIds.length).toBe(2)
    expect(res.body.result.status).toBe(BookStatusEnum.WAIT)

    const checkCategory = await categoryRepository.getCategoryById(category1._id)
    expect(checkCategory.numberOfBook).toBe(0)
    expect(checkCategory.books.length).toBe(0)

    const admin = await seedUserData.createOne({ admin: true })

    header['x-user-id'] = admin.userId
    header['Authorization'] = `Bearer ${admin.token}`

    const adminApprovalSetActive = await request(server)
      .put(`${url}/approve-book/${book._id}`)
      .set(header)
      .send({ status: BookStatusEnum.ACTIVE })
    const categoryAfterApprovalSetActive: any = await categoryRepository.getAllCategory()

    expect(adminApprovalSetActive.status).toBe(200)
    expect(adminApprovalSetActive.body.result.status).toBe(BookStatusEnum.ACTIVE)
    expect(adminApprovalSetActive.body.result.isActive).toBe(true)

    expect(categoryAfterApprovalSetActive[0].numberOfBook).toBe(1)
    expect(categoryAfterApprovalSetActive[0].books[0]._id.toString()).toBe(book._id.toString())
    expect(categoryAfterApprovalSetActive[1].numberOfBook).toBe(1)
    expect(categoryAfterApprovalSetActive[1].books[0]._id.toString()).toBe(book._id.toString())

    const adminApprovalSetCancel = await request(server)
      .put(`${url}/approve-book/${book._id}`)
      .set(header)
      .send({ status: BookStatusEnum.CANCEL })
    const categoryAfterApprovalSetCancel = await categoryRepository.getAllCategory()

    expect(adminApprovalSetCancel.status).toBe(200)
    expect(adminApprovalSetCancel.body.result.status).toBe(BookStatusEnum.CANCEL)
    expect(adminApprovalSetCancel.body.result.isActive).toBe(false)

    expect(categoryAfterApprovalSetCancel[0].numberOfBook).toBe(0)
    expect(categoryAfterApprovalSetCancel[0].books.length).toBe(0)
    expect(categoryAfterApprovalSetCancel[1].numberOfBook).toBe(0)
    expect(categoryAfterApprovalSetCancel[1].books.length).toBe(0)
  })

  it(`Success => Should create category`, async () => {
    const payload = {
      name: 'Sci-fi',
      description: 'Science fiction'
    }

    const admin = await seedUserData.createOne({ admin: true })

    header['x-user-id'] = admin.userId
    header['Authorization'] = `Bearer ${admin.token}`

    const res = await request(server).post(`${url}/create-category`).set(header).send(payload)

    expect(res.status).toBe(200)
    expect(res.body.result.message).toBe('New category succesfully created')
    expect(res.body.result.data).toMatchObject({
      categoryName: payload.name,
      categoryDescription: payload.description
    })
  })

  it(`Error => Admin get a user should got error: Invalid param`, async () => {
    const admin = await seedUserData.createOne({ admin: true })
    header['x-user-id'] = admin.userId
    header['Authorization'] = `Bearer ${admin.token}`

    const res = await request(server).get(`${url}/get-user/123`).set(header).send()

    expect(res.status).toBe(400)
    expect(res.body.errors.message).toBe('INVALID_PARAM')
  })

  it(`Error => Create category should got error: Category is already exist`, async () => {
    const payload = {
      name: 'Sci-fi',
      description: 'Science fiction'
    }
    await seedCategoryData.createOne({ name: 'Sci-fi' })

    const admin = await seedUserData.createOne({ admin: true })

    header['x-user-id'] = admin.userId
    header['Authorization'] = `Bearer ${admin.token}`

    const res = await request(server).post(`${url}/create-category`).set(header).send(payload)
    expect(res.status).toBe(400)
    expect(res.body.errors.flag).toBe('CATEGORY_IS_ALREADY_EXIST')
  })

  it(`Error => Should got error: user can't access Admin API`, async () => {
    const user = await seedUserData.createOne({ admin: false })

    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`
    const res = await request(server).get(`${url}/get-users`).set(header).send()

    expect(res.status).toBe(401)
    expect(res.body.errors.flag).toBe('USER_UNAUTHORIZED')
  })

  it(`Error => Delete a user should got error: Invalid param`, async () => {
    const admin = await seedUserData.createOne({ admin: true })

    header['x-user-id'] = admin.userId
    header['Authorization'] = `Bearer ${admin.token}`
    const res = await request(server).delete(`${url}/123`).set(header).send()
    expect(res.status).toBe(400)
    expect(res.body.errors.message).toBe('INVALID_PARAM')
  })

  it(`Error => Delete a user should got error: No such a user`, async () => {
    const admin = await seedUserData.createOne({ admin: true })

    header['x-user-id'] = admin.userId
    header['Authorization'] = `Bearer ${admin.token}`
    const res = await request(server).delete(`${url}/607ea12bd21e76a4433ea592`).set(header).send()

    expect(res.status).toBe(404)
    expect(res.body.errors.flag).toBe('USER_NOT_FOUND')
  })

  it(`Error => Blocking a user should got error: Invalid param`, async () => {
    const admin = await seedUserData.createOne({ admin: true })

    header['x-user-id'] = admin.userId
    header['Authorization'] = `Bearer ${admin.token}`
    const res = await request(server)
      .patch(`${url}/123`)
      .set(header)
      .query({ setActive: true, setStatus: UserStatusEnum.ACTIVE })
      .send()
    expect(res.status).toBe(400)
    expect(res.body.errors.message).toBe('INVALID_PARAM')
  })

  it(`Error => Blocking a user should got error: No such a user`, async () => {
    const admin = await seedUserData.createOne({ admin: true })

    header['x-user-id'] = admin.userId
    header['Authorization'] = `Bearer ${admin.token}`
    const res = await request(server)
      .patch(`${url}/607ea12bd21e76a4433ea592`)
      .set(header)
      .query({ setActive: true, setStatus: UserStatusEnum.ACTIVE })
      .send()

    expect(res.status).toBe(404)
    expect(res.body.errors.flag).toBe('USER_NOT_FOUND')
  })

  it(`Error => Should block and unblocking a user: Required query not set `, async () => {
    const user = await seedUserData.createOne({ admin: false })

    const getUser = await userRepository.getOneUser(user.userId)
    expect(getUser.isActive).toBe(true)
    expect(getUser.status).toBe(UserStatusEnum.ACTIVE)
    expect(user).toMatchObject({
      userId: getUser._id,
      email: getUser.email
    })

    const admin = await seedUserData.createOne({ admin: true })

    header['x-user-id'] = admin.userId
    header['Authorization'] = `Bearer ${admin.token}`

    const res = await request(server).patch(`${url}/${user.userId}`).set(header).send()
    expect(res.status).toBe(400)
    expect(res.body.errors.message).toBe('INVALID_PARAM')
  })

  it(`Error => Approve a book should got error: Invalid param`, async () => {
    const admin = await seedUserData.createOne({ admin: true })

    header['x-user-id'] = admin.userId
    header['Authorization'] = `Bearer ${admin.token}`

    const res = await request(server).put(`${url}/approve-book/0123456789`).set(header).send({ status: 'ACTIVE' })

    expect(res.status).toBe(400)
    expect(res.body.errors.message).toBe('INVALID_PARAM')
  })

  it(`Error => Approve a book should got error: Book not found`, async () => {
    const admin = await seedUserData.createOne({ admin: true })

    header['x-user-id'] = admin.userId
    header['Authorization'] = `Bearer ${admin.token}`

    const res = await request(server)
      .put(`${url}/approve-book/6098a9867105050cf0550956`)
      .set(header)
      .send({ status: 'ACTIVE' })
    expect(res.status).toBe(404)
    expect(res.body.errors.flag).toBe('BOOK_NOT_FOUND')
  })

  it(`Error => Approve a book should got error: Book update with same status`, async () => {
    const admin = await seedUserData.createOne({ admin: true })

    const book = await seedBookData.createOne({})

    header['x-user-id'] = admin.userId
    header['Authorization'] = `Bearer ${admin.token}`

    const res = await request(server).put(`${url}/approve-book/${book._id}`).set(header).send({ status: book.status })

    expect(res.status).toBe(406)
    expect(res.body.errors.flag).toBe('BOOK_SAME_STATUS')
  })
})
