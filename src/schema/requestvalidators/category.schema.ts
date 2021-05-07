import Joi from 'joi'

export class CategorySchema {
  getCategory = {
    header: Joi.object({
      'x-user-id': Joi.string().required()
    }).required()
  }
  createCategory = {
    header: Joi.object({
      'x-user-id': Joi.string().required()
    }).required(),
    body: Joi.object({
      isActive: Joi.boolean(),
      name: Joi.string().required(),
      numberOfBook: Joi.number(),
      bookIds: Joi.array(),
      description: Joi.string().required()
    }).required()
  }
}
