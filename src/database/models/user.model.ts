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
  userName: string
  fullName?: string
  gender?: UserGenderEnum
  phone?: string
  address?: string
  isAdmin?: boolean
  status?: UserStatusEnum
  bookmarkedBook?: string[]
  totalBookmarked?: number
  uploadedBook?: string[]
  postedBlogs?: string[]
  bookmarkedBlog?: string[]
  avatar?: string
  connections?: string[]
  verified?: boolean
}

export type IUserDoc = IUser & Document

const UserSchema = new Schema(
  {
    isActive: { type: Boolean, default: true },
    userIsAuthor: { type: Boolean, default: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userName: { type: String, required: true },
    fullName: { type: String, default: null },
    gender: { type: String, enum: ['MALE', 'SHEMALE', 'OTHER'], default: 'OTHER' },
    phone: { type: String, default: null },
    address: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
    status: { type: String, enum: ['BLOCKED', 'ACTIVE'], default: 'ACTIVE' },
    uploadedBook: [{ type: Schema.Types.ObjectId, ref: 'Book', default: null }],
    bookmarkedBook: [{ type: Schema.Types.ObjectId, ref: 'Book', default: null }],
    totalBookmarked: { type: Number, default: 0 },
    postedBlogs: [{ type: Schema.Types.ObjectId, ref: 'Blog', default: null }],
    bookmarkedBlog: [{ type: Schema.Types.ObjectId, ref: 'Blog', default: null }],
    avatar: { type: String, default: null },
    connections: [{ type: Schema.Types.ObjectId, default: null }],
    verified: { type: Boolean, default: false }
  },
  { timestamps: true }
)

export const UserModel = model<IUserDoc>('User', UserSchema, 'users')
