import { Document, model, Schema } from 'mongoose'

export interface IBlog {
  title: string
  author: string
  tags: string[]
  publication: Date
  views?: number
  content: string
  blogThumbnail: string
  bookMarked?: number
  bookMarkedBy?: string[]
}

export type IBlogDoc = IBlog & Document

const BlogSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String, required: false, default: null }],
    publication: { type: Date, required: true },
    views: { type: Number, required: true, default: 0 },
    content: { type: String, required: true },
    blogThumbnail: { type: String, required: true },
    bookMarked: { type: Number, required: false, default: 0 },
    bookMarkedBy: [{ type: Schema.Types.ObjectId, ref: 'User', required: false, default: null }]
  },
  { timestamps: true }
)

export const BlogModel = model<IBlogDoc>('Blog', BlogSchema, 'blogs')
