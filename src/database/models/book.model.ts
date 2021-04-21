import { Document, model, Schema } from 'mongoose'

export interface IBook {
  isActive: boolean
  title: string
  isbn: string
  authors: string[]
  categoryIds?: any[]
  publication: Date
  pages: number
  uploadBy: any
  views: number
  aboutBook: string
  file: string
  thumbnail: string
  bookMarked: number
  bookMarkedBy?: any[]
}

export type IBookDoc = IBook & Document

const BookSchema = new Schema(
  {
    isActive: { type: Boolean, required: true },
    title: { type: String, required: true },
    isbn: { type: String, required: false, default: null },
    authors: [{ type: String, required: true }],
    categoryIds: [{ type: Schema.Types.ObjectId, ref: 'Category', required: false, default: null }],
    publication: { type: Date, required: true },
    pages: { type: Number, required: true },
    uploadBy: { type: Schema.Types.ObjectId, ref: 'book', required: true, default: null },
    views: { type: Number, required: true, default: 0 },
    aboutBook: { type: String, required: true },
    file: { type: String, required: true },
    thumbnail: { type: String, required: true },
    bookMarked: { type: String, required: true },
    bookMarkedBy: [{ type: Schema.Types.ObjectId, ref: 'book', required: false, default: null }]
  },
  { timestamps: true }
)

export const BookModel = model<IBookDoc>('Book', BookSchema, 'books')
