import Joi from 'joi'

export class UserSchema {
  registerUser = {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      fullName: Joi.string().min(3).required(),
      userName: Joi.string().min(3).required(),
      gender: Joi.string().valid('MALE', 'SHEMALE').required(),
      phone: Joi.string()
        .regex(/^[0-9]+$/)
        .required(),
      address: Joi.string().required(),
      avatar: Joi.required()
    })
  }
  loginUser = {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required()
    })
  }
  getUser = {
    query: Joi.object({
      isAdmin: Joi.boolean()
    }).required()
  }
}
