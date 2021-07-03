import Joi from 'joi'

export class UserSchema {
  registerUser = {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      userName: Joi.string().min(3).required(),
      fullName: Joi.string().min(3),
      gender: Joi.string().valid('MALE', 'SHEMALE'),
      phone: Joi.string().regex(/^[0-9]+$/),
      address: Joi.string(),
      isAdmin: Joi.boolean(),
      bookmarkedBook: Joi.array(),
      uploadedBook: Joi.array()
    })
  }

  loginUser = {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required()
    })
  }

  getUser = {
    header: Joi.object({
      'x-user-id': Joi.string().required()
    }),
    query: Joi.object({
      isAdmin: Joi.boolean().required()
    }).required()
  }

  getUsers = {
    header: Joi.object({
      'x-user-id': Joi.string().required()
    }).required(),
    query: Joi.object({
      page: Joi.number()
    }).required()
  }

  blockUser = {
    query: Joi.object({
      setActive: Joi.boolean().required(),
      setStatus: Joi.string().valid('BLOCKED', 'ACTIVE').required()
    }).required()
  }
}
