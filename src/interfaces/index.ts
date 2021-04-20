import { ValidationError } from 'joi'

export interface IGetLocalizedMsgOption {
  key: string
  vars?: any
}

export interface IHttpExceptionOptions {
  joiError?: ValidationError
  localeMessage?: IGetLocalizedMsgOption
}
