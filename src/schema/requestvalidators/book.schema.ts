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
}
