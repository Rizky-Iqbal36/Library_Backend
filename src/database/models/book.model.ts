import { Entity, Column, ObjectIdColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm'

@Entity({ name: 'Books' })
export class BookModel {
  @ObjectIdColumn()
  id: string

  @Column({ default: true })
  isActive: boolean

  @Column()
  title: string

  @Column({ unique: true })
  ISBN: string

  @Column()
  author: string

  @Column('simple-array', { default: [] })
  category: string[]

  @Column()
  publication: Date

  @Column()
  pages: number

  @Column()
  uploadBy: string

  @Column()
  aboutBook: string

  @Column()
  thumbnail: string

  @Column()
  file: string

  @Column()
  bookMarked: number

  @Column('simple-array', { default: [] })
  bookMarkedBy: string[]

  @Column()
  views: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
