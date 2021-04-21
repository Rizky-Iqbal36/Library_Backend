import { Injectable } from '@nestjs/common'
import { CategoryModel, ICategory } from '@database/models/category.model'

@Injectable()
export class CategoryRepository {
  private readonly categoryModel = CategoryModel

  public async getAllCategory() {
    return this.categoryModel.find().populate('bookId')
  }

  public async getCategoryByName(name: string) {
    return this.categoryModel.find({ where: { name } })
  }

  public async createCategory(data: ICategory) {
    return this.categoryModel.create(data)
  }
}
