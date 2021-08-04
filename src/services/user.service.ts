import { Injectable } from '@nestjs/common'
import { UserRepository } from '@root/repositories/user.repository'
import { AuthService } from '@root/authentication/service/auth.service'
import { BadRequestException, NotFoundException } from '@root/app/exception/httpException'
import { httpFlags } from '@root/constant/flags'
import { IUser, IUserLogin } from '@root/database/models/user.model'
import { UserStatusEnum } from '@root/interfaces/enum'
import config from '@root/app/config/appConfig'

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository, private readonly authService: AuthService) {}

  public async registerUser(body: IUser) {
    const user = await this.userRepository.getUserByEmail(body.email)

    if (user) throw new BadRequestException(httpFlags.EMAIL_ALREADY_EXIST)

    const hashedPassword = await this.authService.hashPassword(body.password)
    body.password = hashedPassword

    const storedUser = await this.userRepository.createUser(body)

    const token = this.authService.generateToken(storedUser._id)

    return {
      message: 'Registration has been successfully carried out',
      data: { userId: storedUser._id, email: storedUser.email, token }
    }
  }

  public async loginUser(body: IUserLogin) {
    const user = await this.userRepository.getUserByEmail(body.email)

    if (!user) throw new BadRequestException(httpFlags.EMAIL_OR_PASSWORD_INVALID)

    const isPasswordValid = await this.authService.comparePassword(body.password, user.password)

    if (!isPasswordValid) throw new BadRequestException(httpFlags.EMAIL_OR_PASSWORD_INVALID)

    const token = this.authService.generateToken(user._id)

    return { message: 'Login success', data: { userId: user._id, email: body.email, token } }
  }

  public async findAllUser(page: number) {
    const take = 10
    const skip = (page - 1) * take || 0
    const users = await this.userRepository.getAllUsers({ options: { skip, take } })
    const totalUsers = await this.userRepository.countUsers()
    return {
      currentPage: page,
      totalPage: Math.ceil(totalUsers / take),
      totalBookOnThisPage: users.length,
      data: users
    }
  }

  public async findOneUser(id: string) {
    const user = await this.userRepository.getOneUser(id, true)
    if (user) {
      return user
    } else {
      throw new NotFoundException(httpFlags.USER_NOT_FOUND, { localeMessage: { key: 'USER_NOT_FOUND' } })
    }
  }

  public async updateAvatar(id: string) {
    const user = await this.findOneUser(id)
    const count = user.avatar ? parseInt(user.avatar.charAt(user.avatar.length - 5)) + 1 : 0
    user.avatar = `avatar-${id}-${count}.jpg`
    await user.save()
    user.avatar = `${config.cloudinary.assets}/avatars/${id}/${user.avatar}`
    return user
  }

  public async blockUser(id: string, setActive: boolean, setStatus: UserStatusEnum) {
    const user = await this.findOneUser(id)
    user.status = setStatus
    user.isActive = setActive
    await user.save()
    return user
  }

  public async deleteUser(id: string) {
    await this.findOneUser(id)
    await this.userRepository.deleteOneUser(id)
    return {
      message: `User with id: ${id} has successfully deleted`
    }
  }
}
