import faker from 'faker'
import { Injectable } from '@nestjs/common'
import { UserRepository } from '@root/repositories/user.repository'
import { AuthService } from '@root/authentication/service/auth.service'
import { UserStatusEnum, UserGenderEnum } from '@root/interfaces/enum'

interface ISeedUser {
  userId: any
  email: string
  password: string
  token: string
}

@Injectable()
export class SeedUserData {
  constructor(private readonly userRepository: UserRepository, private readonly authService: AuthService) {}
  async createMany(loop: number) {
    const all: ISeedUser[] = []
    for (let i = 0; i < loop; i++) {
      all.push(await this.createOne({ admin: false }))
    }
    return all
  }

  async createOne({
    email = faker.internet.email(),
    password = faker.internet.password(8),
    admin = false,
    active = true,
    userStatus = UserStatusEnum.ACTIVE,
    bookmarkedBook = [],
    uploadedBook = []
  }: {
    email?: string
    password?: string
    admin?: boolean
    active?: boolean
    userStatus?: UserStatusEnum
    bookmarkedBook?: string[]
    uploadedBook?: string[]
  }) {
    const hashedPassword = await this.authService.hashPassword(password)
    const UserGender = Object.keys(UserGenderEnum).map(val => UserGenderEnum[val])
    const data = await this.userRepository.createUser({
      isActive: active,
      email,
      password: hashedPassword,
      fullName: `${faker.name.firstName()} ${faker.name.middleName()} ${faker.name.lastName()}`,
      userName: faker.internet.userName(),
      gender: faker.random.arrayElement(UserGender),
      phone: faker.phone.phoneNumber('62822########'),
      address: faker.address.streetAddress(),
      isAdmin: admin,
      status: userStatus || UserStatusEnum.ACTIVE,
      ...(bookmarkedBook.length > 0 ? { bookmarkedBook: bookmarkedBook } : {}),
      ...(uploadedBook.length > 0 ? { uploadedBook: uploadedBook } : {})
    })
    const token = await this.authService.generateToken(data._id)
    return {
      userId: data._id,
      email,
      password,
      token
    }
  }
}
