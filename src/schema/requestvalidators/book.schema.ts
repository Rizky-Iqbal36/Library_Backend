import Joi from 'joi'

export class BookSchema {
  getBook = {
    query: Joi.object({
      bookmark: Joi.string().valid('BOOKMARK', 'UNBOOKMARK').allow('')
    }).required()
  }
}
