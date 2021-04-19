import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm'

@Entity({ name: 'Books' })
export class BookModel {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ default: true })
  isActive: boolean

  @Column()
  title: string

  @Column({ unique: true })
  ISBN: string

  @Column()
  author: string

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

  @Column()
  views: number

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  deletedAt: Date
}
