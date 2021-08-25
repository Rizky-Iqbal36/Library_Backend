import { HttpException, HttpStatus } from '@nestjs/common'
import { IHttpExceptionOptions } from '@root/interfaces'

export class CustomException extends HttpException {
  constructor(httpStatus: number, flag: string, options?) {
    super(
      {
        flag,
        options
      },
      httpStatus
    )
  }
}

export class SuccessResponse extends HttpException {
  constructor(data: any) {
    super(data, HttpStatus.OK)
  }
}

export class BadRequestException extends CustomException {
  constructor(flag: any, options?: IHttpExceptionOptions) {
    super(HttpStatus.BAD_REQUEST, flag, options)
  }
}

export class UnauthorizedException extends CustomException {
  constructor(flag: any, options?: IHttpExceptionOptions) {
    super(HttpStatus.UNAUTHORIZED, flag, options)
  }
}

export class ForbiddenException extends CustomException {
  constructor(flag: any, options?: IHttpExceptionOptions) {
    super(HttpStatus.FORBIDDEN, flag, options)
  }
}

export class NotAcceptableException extends CustomException {
  constructor(flag: any, options?: IHttpExceptionOptions) {
    super(HttpStatus.NOT_ACCEPTABLE, flag, options)
  }
}

export class RequestTimeoutException extends CustomException {
  constructor(flag: any, options?: IHttpExceptionOptions) {
    super(HttpStatus.REQUEST_TIMEOUT, flag, options)
  }
}

export class ConflictException extends CustomException {
  constructor(flag: any, options?: IHttpExceptionOptions) {
    super(HttpStatus.CONFLICT, flag, options)
  }
}

export class HttpVersionNotSupportedException extends CustomException {
  constructor(flag: any, options?: IHttpExceptionOptions) {
    super(HttpStatus.HTTP_VERSION_NOT_SUPPORTED, flag, options)
  }
}

export class BadGatewayException extends CustomException {
  constructor(flag: any, options?: IHttpExceptionOptions) {
    super(HttpStatus.BAD_GATEWAY, flag, options)
  }
}

export class ServiceUnavailableException extends CustomException {
  constructor(flag: any, options?: IHttpExceptionOptions) {
    super(HttpStatus.SERVICE_UNAVAILABLE, flag, options)
  }
}

export class InternalServerErrorException extends CustomException {
  constructor(flag: any, options?: IHttpExceptionOptions) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, flag, options)
  }
}

export class TooManyRequestException extends CustomException {
  constructor(flag: any, options?: IHttpExceptionOptions) {
    super(HttpStatus.TOO_MANY_REQUESTS, flag, options)
  }
}
export class NotFoundException extends CustomException {
  constructor(flag: any, options?: IHttpExceptionOptions) {
    super(HttpStatus.NOT_FOUND, flag, options)
  }
}
