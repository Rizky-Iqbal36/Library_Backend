import { Request, Response, NextFunction } from 'express'
import { NestMiddleware, Injectable } from '@nestjs/common'
import { UnauthorizedException, ForbiddenException, BadRequestException } from '@app/exception/httpException'
import { httpFlags } from '@root/constant/flags'
import { UserRepository } from '@root/repositories/user.repository'

@Injectable()
export class UserAuthMiddleware implements NestMiddleware {
  constructor(private readonly userRepository: UserRepository) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const userId = req.header('x-user-id')
    if (!userId) throw new UnauthorizedException(httpFlags.USER_UNAUTHORIZED)

    const userData = await this.userRepository.getOneUser(userId)
    if (!userData) throw new ForbiddenException(httpFlags.USER_NOT_FOUND)
    if (!userData.isActive) throw new BadRequestException(httpFlags.USER_BLOCKED)

    next()
  }
}
