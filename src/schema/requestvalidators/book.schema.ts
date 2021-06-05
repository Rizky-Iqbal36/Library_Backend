import Joi from 'joi'

export class BookSchema {
  getBook = {
    header: Joi.object({
      'x-user-id': Joi.string().required()
    }).required(),
    query: Joi.object({
      bookmark: Joi.string().valid('BOOKMARK', 'UNBOOKMARK').allow('')
    }).required()
  }

  updateBook = {
    body: Joi.object({
      isActive: Joi.boolean(),
      status: Joi.string().valid('WAIT', 'CANCEL', 'ACTIVE'),
      title: Joi.string(),
      isbn: Joi.string(),
      authors: Joi.array(),
      categoryIds: Joi.array(),
      publication: Joi.string(),
      pages: Joi.number(),
      uploadBy: Joi.string(),
      views: Joi.number(),
      aboutBook: Joi.string(),
      file: Joi.string(),
      thumbnail: Joi.string(),
      bookMarked: Joi.number(),
      bookMarkedBy: Joi.array()
    }).required()
  }

  approveBook = {
    body: Joi.object({
      status: Joi.string().valid('WAIT', 'CANCEL', 'ACTIVE')
    }).required()
  }

  createBook = {
    body: Joi.object({
      isActive: Joi.boolean(),
      status: Joi.string().valid('WAIT', 'CANCEL', 'ACTIVE'),
      title: Joi.string().required(),
      isbn: Joi.string().min(12),
      authors: Joi.array().required(),
      categoryIds: Joi.array(),
      publication: Joi.string().required(),
      pages: Joi.alternatives(Joi.number(), Joi.string()).required(),
      views: Joi.number(),
      aboutBook: Joi.string().required(),
      bookMarked: Joi.number(),
      bookMarkedBy: Joi.array()
    }).required()
  }
}
