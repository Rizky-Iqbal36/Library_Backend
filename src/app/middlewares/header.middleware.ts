import { NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { ForbiddenException } from '@app/exception/httpException'

export class HeaderMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    Joi.object({
      'accept-language': Joi.string(),
      date: Joi.date().iso().required(),
      'x-trace-id': Joi.string().uuid().required()
    })
      .unknown()
      .validateAsync(req.headers)
      .then(() => {
        next()
      })
      .catch(error => next(new ForbiddenException('INVALID_HEADERS', { joiError: error })))
  }
}
