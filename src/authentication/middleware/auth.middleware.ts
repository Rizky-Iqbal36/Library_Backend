import { Request, Response, NextFunction } from 'express'
import { NestMiddleware, Injectable } from '@nestjs/common'
import { UnauthorizedException, BadRequestException } from '@app/exception/httpException'
import { httpFlags } from '@root/constant/flags'
import { AuthService } from '@root/authentication/service/auth.service'

@Injectable()
export class UserAuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const authorization = req.header('Authorization')
    const token = authorization.replace('Bearer ', '')
    if (!authorization || !token) throw new UnauthorizedException(httpFlags.USER_UNAUTHORIZED)
    try {
      await this.authService.verifyToken(token)
      next()
    } catch (err) {
      throw new BadRequestException(httpFlags.INVALID_TOKEN)
    }
  }
}
