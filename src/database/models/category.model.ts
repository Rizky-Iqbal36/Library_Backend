import { Entity, Column, ObjectIdColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm'

@Entity({ name: 'Category' })
export class CategoryModel {
  @ObjectIdColumn()
  id: string

  @Column({ default: true })
  isActive: boolean

  @Column()
  name: string

  @Column()
  numberOfBook: number

  @Column('simple-array', { default: [] })
  book: string[]

  @Column()
  description: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
