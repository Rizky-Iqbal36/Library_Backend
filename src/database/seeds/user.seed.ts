import faker from 'faker'
import { Injectable } from '@nestjs/common'
import { UserRepository } from '@root/repositories/user.repository'

@Injectable()
export class SeedUserData {
  constructor(private readonly userRepository: UserRepository) {}
  async createMany(loop: number) {
    const all = []
    for (let i = 0; i < loop; i++) {
      all.push(await this.createOne())
    }
    return all
  }

  async createOne(bookmarkedBook?: string[], isAdmin?: boolean, uploadedBook?: string[]) {
    return this.userRepository.createUser({
      isActive: true,
      userIsAuthor: faker.datatype.boolean(),
      email: faker.internet.email(),
      password: faker.internet.password(8),
      fullName: `${faker.name.firstName()} ${faker.name.middleName()} ${faker.name.lastName()}`,
      userName: faker.internet.userName(),
      gender: faker.random.arrayElement(['MALE', 'SHEMALE']),
      phone: faker.phone.phoneNumber('62822########'),
      address: faker.address.streetAddress(),
      isAdmin: isAdmin ? isAdmin : faker.datatype.boolean(),
      ...(bookmarkedBook ? { bookmarkedBook: bookmarkedBook } : {}),
      ...(uploadedBook ? { uploadedBook: uploadedBook } : {}),
      totalBookmarked: 0,
      avatar: faker.image.avatar()
    })
  }
}
