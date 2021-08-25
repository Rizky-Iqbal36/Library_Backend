import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { IExceptionResponse } from '@root/interfaces'
import { getLocalizedMsg } from '@app/i18n/translation'

@Catch(HttpException, Error)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()
    const method = request.method
    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'INTERNAL_SERVER_ERROR'

    let result: any
    let path: any
    if (exception instanceof HttpException) {
      status = exception.getStatus()
      result = exception.getResponse() as IExceptionResponse
    }
    if (status !== 500) message = result.message === '' || result.message === undefined ? result.flag : result.message
    if (result?.options?.localeMessage) message = getLocalizedMsg(result.options.localeMessage, request.language)
    if (result?.options?.plainMessage) message = result?.options?.plainMessage

    const details = result?.options?.joiError?.details
    let errors = {
      flag: result?.flag,
      message,
      details
    }
    if (status !== 200) {
      result = undefined
      path = request.url
    } else {
      errors = undefined
      path = undefined
    }
    response.status(status).json({
      statusCode: status,
      path,
      method,
      result,
      errors,
      accessTime: new Date().toISOString()
    })
  }
}
