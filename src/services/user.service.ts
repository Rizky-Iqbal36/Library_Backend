import { Injectable } from '@nestjs/common'
import { UserRepository } from '@root/repositories/user.repository'
import { BadRequestException } from '@root/app/exception/httpException'
import { httpFlags } from '@root/constant/flags'

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  public async findAllUser(isAdmin: boolean) {
    return this.userRepository.getAllUsers(isAdmin)
  }

  public async findOneUser(id: string) {
    const user = await this.userRepository.getOneUser(id)
    if (user) {
      return user
    } else {
      throw new BadRequestException(httpFlags.USER_NOT_FOUND)
    }
  }
}
