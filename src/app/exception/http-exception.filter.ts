import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response } from 'express'
import { IExceptionResponse } from '@root/interfaces'

@Catch(HttpException, Error)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'INTERNAL_SERVER_ERROR'

    let result: any
    let detail: any
    if (exception instanceof HttpException) {
      status = exception.getStatus()
      result = exception.getResponse() as IExceptionResponse
    }
    if (result?.options?.joiError) detail = result?.options?.joiError?.details
    console.log(result?.options?.joiError)

    if (status !== 500) message = result.flag
    response.status(status).json({
      statusCode: status,
      path: request.url,
      message,
      detail,
      timestamp: new Date().toISOString()
    })
  }
}
