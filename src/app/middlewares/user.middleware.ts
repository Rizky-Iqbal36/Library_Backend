import { Request, Response, NextFunction } from 'express'
import { NestMiddleware, Injectable } from '@nestjs/common'
import { ForbiddenException, BadRequestException } from '@app/exception/httpException'
import { httpFlags } from '@root/constant/flags'
import { UserRepository } from '@root/repositories/user.repository'

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(private readonly userRepository: UserRepository) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const userId = req.header('x-user-id')
    if (!userId) throw new ForbiddenException(httpFlags.FORBIDDEN)

    const userData = await this.userRepository.getOneUser(userId, false)
    if (!userData) throw new ForbiddenException(httpFlags.USER_NOT_FOUND)
    if (!userData.isActive) throw new BadRequestException(httpFlags.USER_BLOCKED)

    next()
  }
}
