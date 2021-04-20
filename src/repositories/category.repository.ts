import { EntityRepository, Repository } from 'typeorm'
import { CategoryModel } from '@database/models/category.model'

@EntityRepository(CategoryModel)
export class CategoryRepository extends Repository<CategoryModel> {
  public async getAllCategory() {
    return this.find()
  }
  public async getCategoryByName(name: string) {
    return this.find({ where: { name } })
  }
}
