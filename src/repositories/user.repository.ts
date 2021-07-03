import { Injectable } from '@nestjs/common'
import { UserModel, IUser } from '@database/models/user.model'
import { IQueryGetAll } from '@root/interfaces'

@Injectable()
export class UserRepository {
  private readonly userModel = UserModel

  public async getAllUsers(query: IQueryGetAll) {
    return this.userModel.find().sort({ createdAt: -1 }).skip(query.options.skip).limit(query.options.take)
  }

  public async countUsers() {
    return this.userModel.countDocuments()
  }
  public async getOneUser(id: string, populate?: boolean) {
    if (populate) return this.userModel.findById(id).populate('bookmarkedBook')
    else return this.userModel.findById(id)
  }

  public async createUser(data: IUser) {
    return this.userModel.create(data)
  }

  public async getUserByEmail(email: string) {
    return this.userModel.findOne({ email })
  }

  public async deleteOneUser(id: string) {
    return this.userModel.findByIdAndDelete(id)
  }
}
