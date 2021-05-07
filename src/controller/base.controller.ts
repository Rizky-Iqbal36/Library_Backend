import { Request } from 'express'
import { httpFlags } from '@root/constant/flags'
import { BadRequestException } from '@root/app/exception/httpException'
import { IRequestValidationSchema } from '@root/interfaces'

import { BookSchema } from '@root/schema/requestvalidators/book.schema'
import { UserSchema } from '@root/schema/requestvalidators/user.schema'
import { CategorySchema } from '@root/schema/requestvalidators/category.schema'

export abstract class BaseController {
  static schemas = {
    bookSchema: new BookSchema(),
    userSchema: new UserSchema(),
    categorySchema: new CategorySchema()
  }
  validateRequest = async (req: Request, schema: IRequestValidationSchema) => {
    const { body, query, headers } = req

    if (schema.body)
      await schema.body.validateAsync(body, { convert: false }).catch(joiError => {
        throw new BadRequestException(httpFlags.INVALID_BODY, { joiError })
      })

    if (schema.query)
      await schema.query.validateAsync(query).catch(joiError => {
        throw new BadRequestException(httpFlags.INVALID_PARAM, { joiError })
      })

    if (schema.headers)
      await schema.headers.validateAsync(headers).catch(joiError => {
        throw new BadRequestException(httpFlags.INVALID_HEADERS, { joiError })
      })
  }
}
