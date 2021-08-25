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
    const path = context.switchToHttp().getRequest().route?.path || context.switchToHttp().getRequest().originalUrl
    const method = context.switchToHttp().getRequest().method
    if (path.includes('blog') && method === 'GET') return next.handle()
    else
      return next.handle().pipe(
        map(data => {
          throw new SuccessResponse(data)
        })
      )
  }
}
