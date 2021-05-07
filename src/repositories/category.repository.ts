import { Injectable } from '@nestjs/common'
import { CategoryModel, ICategory } from '@database/models/category.model'

@Injectable()
export class CategoryRepository {
  private readonly categoryModel = CategoryModel

  public async getAllCategory() {
    return this.categoryModel.find().populate('bookId')
  }

  public async getCategoryByName(name: string) {
    return this.categoryModel.findOne({ where: { name } })
  }

  public async getCategoryById(id: string) {
    return this.categoryModel.findById(id)
  }

  public async createCategory(data: ICategory) {
    return this.categoryModel.create(data)
  }
}
