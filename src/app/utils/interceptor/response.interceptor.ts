import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { SuccessResponse } from '@app/exception/httpException'

export interface Response<T> {
  data: T
}

@Injectable()
export default class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const path: string =
      context.switchToHttp().getRequest().route?.path || context.switchToHttp().getRequest().originalUrl
    if (path.includes('blog')) return next.handle()
    else
      return next.handle().pipe(
        map(data => {
          throw new SuccessResponse(data)
        })
      )
  }
}
