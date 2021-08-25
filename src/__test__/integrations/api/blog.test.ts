import '@root/__test__/matcher/custom-matcher'

import request from 'supertest'
import { INestApplication } from '@nestjs/common'

import { getLocalizedMsg } from '@app/i18n/translation'

import { initServerApp, stopServerApp, flushMongoDB } from '@root/__test__/util/createApp'
import { validHeaders } from '@root/__test__/util/set-header'

import { SeedUserData } from '@database/seeds/user.seed'
import { SeedBlogData } from '@database/seeds/blog.seed'

import { BlogRepository } from '@root/repositories/blog.respository'
import { UserRepository } from '@root/repositories/user.repository'

import { BlogController } from '@root/controller/api/blog.controller'

const url = '/blog'
const header: any = validHeaders

describe(`Blog API`, () => {
  let app: INestApplication
  let server: any

  let seedUserData: SeedUserData
  let seedBlogData: SeedBlogData

  let blogRepository: BlogRepository
  let userRepository: UserRepository

  let blogController: BlogController

  beforeAll(async () => {
    app = await initServerApp()
    server = app.getHttpServer()

    seedUserData = await app.get(SeedUserData)
    seedBlogData = await app.get(SeedBlogData)

    blogRepository = await app.get(BlogRepository)
    userRepository = await app.get(UserRepository)

    blogController = await app.get(BlogController)
    await app.init()
  })

  beforeEach(async () => {
    await flushMongoDB()
  })

  afterAll(async () => {
    await stopServerApp()
  })

  it(`Success => User should post a blog`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const res = await request(server)
      .post(url)
      .set(header)
      .attach('blogThumbnail', __dirname + '/file/images/image.jpeg')
      .field('title', 'Blog')
      .field('content', 'This is a blog')

    expect(res.status).toBe(200)
    expect(res.body.result).toHaveProperty('id')
    expect(res.body.result.message).toBe(getLocalizedMsg({ key: 'BLOG_CREATED' }, header['Accept-Language']))

    const postedBlog = await blogRepository.getOneBlog(res.body.result.id)
    expect(postedBlog).toMatchObject({
      title: 'Blog',
      content: 'This is a blog'
    })

    const userAfterUpload = await userRepository.getOneUser(user.userId.toString())
    expect(userAfterUpload.postedBlogs.length).toBe(1)
    expect(userAfterUpload.postedBlogs[0].toString()).toBe(postedBlog._id.toString())
  })

  it(`Success => Should get a blog`, async () => {
    const blog = await seedBlogData.createOne({})

    const res = await blogController.getOne(blog._id)

    expect(res).toMatchObject({ title: blog.title, content: blog.content })
  })

  it(`Success => Should get many blogs that sorted by most recent publication date`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    await seedBlogData.createMany(15)

    const res = await request(server).get(url).set(header).query({ page: 1 }).send()
    expect(res.status).toBe(200)
    expect(res.body.currentPage).toBe(1)
    expect(res.body.totalBlogsOnThisPage).toBe(10)
    expect(res.body.data[0].publication).dateNewerThan(res.body.data[9].publication)
    expect(res.body.data[1].publication).not.dateNewerThan(res.body.data[0].publication)

    const res1 = await request(server).get(url).set(header).query({ page: 2 }).send()
    expect(res1.status).toBe(200)
    expect(res1.body.currentPage).toBe(2)
    expect(res1.body.totalBlogsOnThisPage).toBe(5)
    expect(res1.body.data[0].publication).dateNewerThan(res1.body.data[4].publication)
    expect(res1.body.data[1].publication).not.dateNewerThan(res1.body.data[0].publication)

    expect(res.body.data[9].publication).dateNewerThan(res1.body.data[0].publication)
  })

  it(`Error => Invalid file type`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const res = await request(server)
      .post(url)
      .set(header)
      .attach('blogThumbnail', __dirname + '/file/docs/image.txt')
      .field('title', 'Blog')
      .field('content', 'This is a blog')

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('errors')
    expect(res.body.errors).toMatchObject({
      flag: 'INVALID_FILETYPE',
      message: getLocalizedMsg({ key: 'IMAGE_ONLY' }, header['Accept-Language'])
    })
  })

  it(`Error => Thumbnail size too big`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const res = await request(server)
      .post(url)
      .set(header)
      .attach('blogThumbnail', __dirname + '/file/images/image-big.jpg')
      .field('title', 'Blog')
      .field('content', 'This is a blog')

    expect(res.status).toBe(413)
    expect(res.body.errors.message).toBe('File too large')
  })

  it(`Error => Post a blog should got error: Invalid body`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const res = await request(server).post(url).set(header).send({ title: 'Blog', content: 'This is a blog' })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('errors')
    expect(res.body.errors).toMatchObject({
      flag: 'INVALID_BODY',
      message: 'Blog validation failed: blog thumbnail required'
    })
  })

  it(`Error => Get a blog should got error: Invalid param`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const res = await request(server).get(`${url}/0123456789`).set(header).send()

    expect(res.status).toBe(400)
    expect(res.body.errors.message).toBe('INVALID_PARAM')
  })

  it(`Error => Get a blog should got error: Blog not found`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const res = await request(server).get(`${url}/6098a9867105050cf0550956`).set(header).send()

    expect(res.status).toBe(404)
    expect(res.body).toHaveProperty('errors')
    expect(res.body.errors).toMatchObject({
      flag: 'BLOG_NOT_FOUND',
      message: getLocalizedMsg(
        { key: 'BLOG_NOT_FOUND', vars: { blogId: '6098a9867105050cf0550956' } },
        header['Accept-Language']
      )
    })
  })
})
