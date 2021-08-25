import Joi from 'joi'

export class BlogSchema {
  getBlog = {
    header: Joi.object({
      'x-user-id': Joi.string().required()
    }).required()
  }

  createBlog = {
    header: Joi.object({
      'x-user-id': Joi.string().required()
    }).required(),
    body: Joi.object({
      title: Joi.string().required(),
      content: Joi.string().required(),
      blogThumbnail: Joi.string(),
      tags: Joi.array().items(Joi.string().required())
    }).required()
  }
}
