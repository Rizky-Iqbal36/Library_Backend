import Joi, { ValidationError } from 'joi'

export interface IGetLocalizedMsgOption {
  key: string
  vars?: any
}

export interface IHttpExceptionOptions {
  joiError?: ValidationError
  localeMessage?: IGetLocalizedMsgOption
  plainMessage?: string
}

export interface IExceptionResponse {
  flag: string
  options?: IHttpExceptionOptions
}

export interface IRequestValidationSchema {
  body?: Joi.Schema
  query?: Joi.Schema
  headers?: Joi.Schema
  header?: Joi.Schema
}

export interface IQueryGetAll {
  options: {
    skip: number
    take: number
  }
}
