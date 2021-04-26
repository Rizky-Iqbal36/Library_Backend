import { Injectable } from '@nestjs/common'
import { UserModel, IUser } from '@database/models/user.model'

@Injectable()
export class UserRepository {
  private readonly userModel = UserModel

  public async getAllUsers(isAdmin) {
    return this.userModel.find({ isAdmin })
  }

  public async getOneUser(id: string) {
    return this.userModel.findById(id)
  }

  public async createUser(data: IUser) {
    return this.userModel.create(data)
  }
}
