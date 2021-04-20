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
