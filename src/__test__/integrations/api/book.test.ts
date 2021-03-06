import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { initServerApp, stopServerApp, flushMongoDB } from '@root/__test__/util/createApp'
import { validHeaders } from '@root/__test__/util/set-header'
import '@root/__test__/matcher/custom-matcher'
import config from '@root/app/config/appConfig'
import { BookStatusEnum } from '@root/interfaces/enum'

import { SeedBookData } from '@database/seeds/book.seed'
import { SeedUserData } from '@database/seeds/user.seed'
import { SeedCategoryData } from '@database/seeds/category.seed'

import { CategoryRepository } from '@root/repositories/category.repository'

const url = '/book'
const header: any = validHeaders
let payload: any

describe(`Book API`, () => {
  let app: INestApplication
  let server: any

  let seedBookData: SeedBookData
  let seedUserData: SeedUserData
  let seedCategoryData: SeedCategoryData

  let categoryRepository: CategoryRepository

  beforeAll(async () => {
    app = await initServerApp()
    server = app.getHttpServer()

    seedBookData = await app.get(SeedBookData)
    seedUserData = await app.get(SeedUserData)
    seedCategoryData = await app.get(SeedCategoryData)

    categoryRepository = await app.get(CategoryRepository)

    await app.init()
  })

  beforeEach(async () => {
    payload = {
      title: 'Harry Potter and the Goblet of Fire',
      authors: ['J.K Rowling'],
      categoryIds: [],
      publication: '8 Juli 2000',
      pages: 882,
      aboutBook: "Harry Potter and the Goblet of Fire is the fourth book in J. K. Rowling's Harry Potter novel series"
      // file: 'harryPotterGobletOfFire.epub',
      // thumbnail: 'harryPotterGobletOfFire.jpg'
    }
    await flushMongoDB()
  })

  afterAll(async () => {
    await stopServerApp()
  })

  it(`Success => User should post a book`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const category = await seedCategoryData.createOne({ name: 'Sci-fi' })

    const res = await request(server)
      .post(url)
      .set(header)
      .attach('thumbnail', __dirname + '/file/images/image.jpeg')
      .attach('file', __dirname + '/file/docs/Learning_React_Native.pdf')
      .field('title', 'Harry Potter and the Goblet of Fire')
      .field('publication', '8 Juli 2000')
      .field('authors[0]', 'J.K Rowling')
      .field('categoryIds[0]', category._id.toString())
      .field('pages', 882)
      .field(
        'aboutBook',
        "Harry Potter and the Goblet of Fire is the fourth book in J. K. Rowling's Harry Potter novel series"
      )

    const categoryAfterUpload = await categoryRepository.getCategoryById(category._id)
    expect(res.status).toBe(200)
    expect(res.body.result).toMatchObject({
      uploadBy: user.userId.toString(),
      status: BookStatusEnum.WAIT,
      categoryIds: [category._id.toString()],
      file: `${config.cloudinary.assets.replace(/rizkyiqbal/, 'rizkyiqbal/raw/upload')}/files/${user.userId}/file-${
        user.userId
      }-0.pdf`,
      thumbnail: `${config.cloudinary.assets}/thumbnails/${user.userId}/thumbnail-${user.userId}-0.jpg`
    })
    expect(categoryAfterUpload.books.length).toBe(0)
    expect(categoryAfterUpload.numberOfBook).toBe(0)
  })

  it(`Success => User should get a book`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const category = await seedCategoryData.createOne({ name: 'Fantasy' })
    const book = await seedBookData.createOne({ categoryIds: [category._id] })
    const res = await request(server).get(`${url}/${book._id}`).set(header).send()

    expect(res.status).toBe(200)
    expect(res.body.result.isbn).toBe(book.isbn)
    expect(res.body.result.categoryIds[0].name).toBe(category.name)
    expect(res.body.result.categoryIds[0]._id).toBe(book.categoryIds[0].toString())
    expect(res.body.result.views).toBe(book.views + 1)
  })

  it(`Success => User should bookmark and unbookmark a book`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const category = await seedCategoryData.createOne({ name: 'Sci-fi' })
    const book = await seedBookData.createOne({ categoryIds: [category._id] })

    const gotUser = await request(server).get(`/user/${user.userId}`).set(header).send()
    expect(gotUser.body.result.bookmarkedBook.length).toBe(0)
    expect(gotUser.body.result.totalBookmarked).toBe(0)

    const res = await request(server).get(`${url}/${book._id}`).set(header).send().query({ bookmark: 'BOOKMARK' })
    expect(res.status).toBe(200)
    expect(res.body.result.bookMarked).toBe(1)

    const updatedUser = await request(server).get(`/user/${user.userId}`).set(header).send()
    expect(updatedUser.body.result.bookmarkedBook.length).toBe(1)
    expect(updatedUser.body.result.totalBookmarked).toBe(1)
    expect(res.body.result.bookMarkedBy[0]).toBe(user.userId.toString())
    expect(updatedUser.body.result.bookmarkedBook[0]._id).toBe(book._id.toString())

    const res1 = await request(server).get(`${url}/${book._id}`).set(header).send().query({ bookmark: 'UNBOOKMARK' })
    expect(res1.status).toBe(200)
    expect(res1.body.result.bookMarked).toBe(0)

    const updatedUser1 = await request(server).get(`/user/${user.userId}`).set(header).send()
    expect(updatedUser1.body.result.bookmarkedBook.length).toBe(0)
    expect(updatedUser1.body.result.totalBookmarked).toBe(0)
  })

  it(`Success => User should get many books that sorted by most recent publication date`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    await seedBookData.createMany(15)
    const res = await request(server).get(url).set(header).query({ page: 1 }).send()
    expect(res.status).toBe(200)
    expect(res.body.result.currentPage).toBe(1)
    expect(res.body.result.totalPage).toBe(2)
    expect(res.body.result.totalBookOnThisPage).toBe(10)
    expect(res.body.result.data[0].publication).dateNewerThan(res.body.result.data[9].publication)
    expect(res.body.result.data[1].publication).not.dateNewerThan(res.body.result.data[0].publication)

    const res2 = await request(server).get(url).set(header).query({ page: 2 }).send()
    expect(res2.status).toBe(200)
    expect(res2.body.result.currentPage).toBe(2)
    expect(res2.body.result.totalPage).toBe(2)
    expect(res2.body.result.totalBookOnThisPage).toBe(5)
    expect(res2.body.result.data[0].publication).dateNewerThan(res2.body.result.data[4].publication)
    expect(res2.body.result.data[1].publication).not.dateNewerThan(res2.body.result.data[0].publication)
  })

  it(`Success => Uploader should delete the book that he or she upload`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const category = await seedCategoryData.createOne({ name: 'Fantasy' })
    const category1 = await seedCategoryData.createOne({ name: 'Drama' })

    const createdBook = await request(server)
      .post(url)
      .set(header)
      .attach('thumbnail', __dirname + '/file/images/image.jpeg')
      .attach('file', __dirname + '/file/docs/Learning_React_Native.pdf')
      .field('title', 'Harry Potter and the Goblet of Fire')
      .field('publication', '8 Juli 2000')
      .field('authors[0]', 'J.K Rowling')
      .field('categoryIds[0]', category._id.toString())
      .field('categoryIds[1]', category1._id.toString())
      .field('pages', 882)
      .field(
        'aboutBook',
        "Harry Potter and the Goblet of Fire is the fourth book in J. K. Rowling's Harry Potter novel series"
      )

    expect(createdBook.body.result).toMatchObject({
      uploadBy: user.userId.toString(),
      status: BookStatusEnum.WAIT,
      categoryIds: [category._id.toString(), category1._id.toString()],
      file: `${config.cloudinary.assets.replace(/rizkyiqbal/, 'rizkyiqbal/raw/upload')}/files/${user.userId}/file-${
        user.userId
      }-0.pdf`,
      thumbnail: `${config.cloudinary.assets}/thumbnails/${user.userId}/thumbnail-${user.userId}-0.jpg`
    })

    const bookId = createdBook.body.result._id

    const admin = await seedUserData.createOne({ admin: true })

    header['x-user-id'] = admin.userId
    header['Authorization'] = `Bearer ${admin.token}`

    await request(server).put(`/admin/approve-book/${bookId}`).set(header).send({ status: BookStatusEnum.ACTIVE })

    const categoryBeforeDeleteBook: any = await categoryRepository.getAllCategory()
    expect(categoryBeforeDeleteBook.length).toBe(2)
    expect(categoryBeforeDeleteBook[0].numberOfBook).toBe(1)
    expect(categoryBeforeDeleteBook[0].numberOfBook).toBe(categoryBeforeDeleteBook[1].numberOfBook)
    expect(categoryBeforeDeleteBook[0].books.length).toBe(1)
    expect(categoryBeforeDeleteBook[0].books[0]._id.toString()).toBe(bookId)
    expect(categoryBeforeDeleteBook[0].books[0]._id).toBe(categoryBeforeDeleteBook[1].books[0]._id)

    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const res = await request(server).delete(`${url}/${bookId}`).set(header).send()

    const categoryAfterDeleteBook = await categoryRepository.getAllCategory()

    expect(categoryAfterDeleteBook.length).toBe(2)
    expect(categoryAfterDeleteBook[0].numberOfBook).toBe(0)
    expect(categoryAfterDeleteBook[0].numberOfBook).toBe(categoryAfterDeleteBook[1].numberOfBook)
    expect(categoryAfterDeleteBook[0].books.length).toBe(0)
    expect(categoryAfterDeleteBook[0].books.length).toBe(categoryAfterDeleteBook[1].books.length)

    expect(res.status).toBe(200)
    expect(res.body.result.message).toBe(`Book with id: ${bookId} has successfully deleted`)
  })

  it(`Error => User upload a book should got error: Invalid body`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const category = await seedCategoryData.createOne({ name: 'Sci-fi' })

    const res = await request(server)
      .post(url)
      .set(header)
      .attach('thumbnail', __dirname + '/file/images/image.jpeg')
      .field('title', 'Harry Potter and the Goblet of Fire')
      .field('publication', '8 Juli 2000')
      .field('authors[0]', 'J.K Rowling')
      .field('categoryIds[0]', category._id.toString())
      .field('pages', 882)
      .field(
        'aboutBook',
        "Harry Potter and the Goblet of Fire is the fourth book in J. K. Rowling's Harry Potter novel series"
      )

    expect(res.status).toBe(400)
    expect(res.body.errors.flag).toBe('INVALID_BODY')
    expect(res.body.errors.message).toBe('Book validation failed: file required')

    const res1 = await request(server)
      .post(url)
      .set(header)
      .field('title', 'Harry Potter and the Goblet of Fire')
      .field('publication', '8 Juli 2000')
      .field('authors[0]', 'J.K Rowling')
      .field('categoryIds[0]', category._id.toString())
      .field('pages', 882)
      .field(
        'aboutBook',
        "Harry Potter and the Goblet of Fire is the fourth book in J. K. Rowling's Harry Potter novel series"
      )

    expect(res1.status).toBe(400)
    expect(res1.body.errors.flag).toBe('INVALID_BODY')
    expect(res1.body.errors.message).toBe('Book validation failed: thumbnail required')
  })

  it(`Error => User upload a book should got error: Invalid type`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const category = await seedCategoryData.createOne({ name: 'Sci-fi' })

    const res = await request(server)
      .post(url)
      .set(header)
      .attach('thumbnail', __dirname + '/file/docs/image.txt')
      .attach('file', __dirname + '/file/docs/Learning_React_Native.pdf')
      .field('title', 'Harry Potter and the Goblet of Fire')
      .field('publication', '8 Juli 2000')
      .field('authors[0]', 'J.K Rowling')
      .field('categoryIds[0]', category._id.toString())
      .field('pages', 882)
      .field(
        'aboutBook',
        "Harry Potter and the Goblet of Fire is the fourth book in J. K. Rowling's Harry Potter novel series"
      )

    expect(res.status).toBe(400)
    expect(res.body.errors.flag).toBe('INVALID_FILETYPE')
    expect(res.body.errors.message).toBe('Only image type files are allowed!')

    const res1 = await request(server)
      .post(url)
      .set(header)
      .attach('thumbnail', __dirname + '/file/images/image.jpeg')
      .attach('file', __dirname + '/file/docs/practicalmachinelearningwithh2o.epub')
      .field('title', 'Harry Potter and the Goblet of Fire')
      .field('publication', '8 Juli 2000')
      .field('authors[0]', 'J.K Rowling')
      .field('categoryIds[0]', category._id.toString())
      .field('pages', 882)
      .field(
        'aboutBook',
        "Harry Potter and the Goblet of Fire is the fourth book in J. K. Rowling's Harry Potter novel series"
      )

    expect(res1.status).toBe(400)
    expect(res1.body.errors.flag).toBe('INVALID_FILETYPE')
    expect(res1.body.errors.message).toBe('Only pdf file is allowed!')
  })

  it(`Error => Delete a book should got error: Invalid param`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const res = await request(server).delete(`${url}/0123456789`).set(header).send()
    expect(res.status).toBe(400)
    expect(res.body.errors.message).toBe('INVALID_PARAM')
  })

  it(`Error => Delete a book should got error: Book not found`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const res = await request(server).delete(`${url}/6098a9867105050cf0550956`).set(header).send()
    expect(res.status).toBe(404)
    expect(res.body.errors.flag).toBe('BOOK_NOT_FOUND')
  })

  it(`Error => Delete a book should got error: Unauthorized`, async () => {
    const user = await seedUserData.createOne({ admin: false })

    const category = await seedCategoryData.createOne({ name: 'Fantasy' })
    const category1 = await seedCategoryData.createOne({ name: 'Drama' })

    const book = await seedBookData.createOne({ categoryIds: [category._id, category1._id], uploadBy: user.userId })

    expect(user.userId).toBe(book.uploadBy)

    const anotherUser = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = anotherUser.userId
    header['Authorization'] = `Bearer ${anotherUser.token}`

    const res = await request(server).delete(`${url}/${book._id}`).set(header).send()

    expect(res.status).toBe(401)
    expect(res.body.errors.flag).toBe('UNAUTHORIZED')
    expect(res.body.errors.message).toBe(`You don't have permission to delete book with id: ${book._id}`)
  })

  it(`Error => Update a book should got error: Book not found`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    payload.title = 'Wingardium Leviosa'
    const res = await request(server).put(`${url}/6098a9867105050cf0550956`).set(header).send(payload)
    expect(res.status).toBe(404)
    expect(res.body.errors.flag).toBe('BOOK_NOT_FOUND')
  })

  it(`Error => Update a book should got error: Category not found`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const book = await seedBookData.createOne({})
    payload.title = 'Expeliarmus'
    payload.categoryIds.push('6098a9d6e45c890d2df28438')
    const res = await request(server).put(`${url}/${book._id}`).set(header).send(payload)
    expect(res.status).toBe(404)
    expect(res.body.errors.flag).toBe('CATEGORY_NOT_FOUND')
  })

  it(`Error => Update a book should got error: Invalid param`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    payload.title = 'Vershmeltzen'
    const res = await request(server).put(`${url}/0123456789`).set(header).send(payload)
    expect(res.status).toBe(400)
    expect(res.body.errors.message).toBe('INVALID_PARAM')
  })

  it(`Error => Get book should got error: Invalid param`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const res = await request(server).get(`${url}/0123456789`).set(header).send()
    expect(res.status).toBe(400)
    expect(res.body.errors.message).toBe('INVALID_PARAM')
  })

  it(`Error => Get Book Should got error: No such a book`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const res = await request(server).get(`${url}/607ea12bd21e76a4433ea592`).set(header).send()
    expect(res.status).toBe(404)
    expect(res.body.errors.flag).toBe('BOOK_NOT_FOUND')
  })

  it(`Error => Bookmark a book should got error: Invalid param`, async () => {
    const user = await seedUserData.createOne({ admin: false })
    header['x-user-id'] = user.userId
    header['Authorization'] = `Bearer ${user.token}`

    const category = await seedCategoryData.createOne({ name: 'Sci-fi' })
    const book = await seedBookData.createOne(category._id)
    const res = await request(server).get(`${url}/${book._id}`).set(header).send().query({ bookmark: 'UWAUW' })
    expect(res.status).toBe(400)
    expect(res.body.errors.message).toBe('INVALID_PARAM')
  })
})
