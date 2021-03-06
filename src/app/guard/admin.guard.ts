import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { UserRepository } from '@root/repositories/user.repository'
import { UnauthorizedException } from '@app/exception/httpException'
import { httpFlags } from '@root/constant/flags'

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly userRepository: UserRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()

    const userId = req.header('x-user-id')

    const user = await this.userRepository.getOneUser(userId, false)

    if (user.isAdmin && user.isActive) return true

    throw new UnauthorizedException(httpFlags.USER_UNAUTHORIZED, { localeMessage: { key: 'USER_UNAUTHORIZED' } })
  }
}
