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

  createBook = {
    body: Joi.object({
      isActive: Joi.boolean(),
      status: Joi.string().valid('WAIT', 'CANCEL', 'ACTIVE'),
      title: Joi.string().required(),
      isbn: Joi.string(),
      authors: Joi.array().required(),
      categoryIds: Joi.array().required(),
      publication: Joi.string().required(),
      pages: Joi.number().required(),
      views: Joi.number(),
      aboutBook: Joi.string().required(),
      file: Joi.string().required(),
      thumbnail: Joi.string().required(),
      bookMarked: Joi.number(),
      bookMarkedBy: Joi.array()
    }).required()
  }
}
