import { Document, model, Schema } from 'mongoose'

export interface ICategory {
  isActive?: boolean
  name: string
  numberOfBook?: number
  books?: string[]
  description: string
}

export type ICategoryDoc = ICategory & Document

const categorySchema = new Schema(
  {
    isActive: { type: Boolean, required: true, default: true },
    name: { type: String, required: true, unique: true },
    numberOfBook: { type: Number, required: false, default: 0 },
    books: [{ type: Schema.Types.ObjectId, ref: 'Book', required: false }],
    description: { type: String, required: true }
  },
  { timestamps: true }
)

export const CategoryModel = model<ICategoryDoc>('Category', categorySchema, 'categories')
