import { Document, model, Schema } from 'mongoose'
import { UserGenderEnum, UserStatusEnum } from '@root/interfaces/enum'

export interface IUserLogin {
  email: string
  password: string
}

export interface IUser {
  isActive?: boolean
  userIsAuthor?: boolean
  email: string
  password: string
  fullName: string
  userName: string
  gender: UserGenderEnum
  phone: string
  address: string
  isAdmin?: boolean
  status?: UserStatusEnum
  bookmarkedBook?: string[]
  uploadedBook?: string[]
  totalBookmarked?: number
  avatar?: string
}

export type IUserDoc = IUser & Document

const UserSchema = new Schema(
  {
    isActive: { type: Boolean, required: true, default: true },
    userIsAuthor: { type: Boolean, required: true, default: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    userName: { type: String, required: true },
    gender: { type: String, enum: ['MALE', 'SHEMALE'], required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    status: { type: String, required: true, enum: ['BLOCKED', 'ACTIVE'], default: 'ACTIVE' },
    uploadedBook: [{ type: Schema.Types.ObjectId, ref: 'Book', required: false, default: null }],
    bookmarkedBook: [{ type: Schema.Types.ObjectId, ref: 'Book', required: false, default: null }],
    totalBookmarked: { type: Number, required: false, default: 0 },
    avatar: { type: String, required: false, default: null }
  },
  { timestamps: true }
)

export const UserModel = model<IUserDoc>('User', UserSchema, 'users')
