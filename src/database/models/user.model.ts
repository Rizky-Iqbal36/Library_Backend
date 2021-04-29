import { Document, model, Schema } from 'mongoose'

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
  gender: string
  phone: string
  address: string
  isAdmin?: boolean
  bookmarkedBook?: string[]
  uploadedBook?: string[]
  totalBookmarked?: number
  avatar: string
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
    uploadedBook: [{ type: Schema.Types.ObjectId, ref: 'Book', required: false, default: null }],
    bookmarkedBook: [{ type: Schema.Types.ObjectId, ref: 'Book', required: false, default: null }],
    totalBookmarked: { type: Number, required: false, default: 0 },
    avatar: { type: String, required: true }
  },
  { timestamps: true }
)

export const UserModel = model<IUserDoc>('User', UserSchema, 'users')
