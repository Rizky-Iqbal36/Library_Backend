import { Injectable } from '@nestjs/common'
import { CategoryRepository } from '@root/repositories/category.repository'
import { ICategory } from '@root/database/models/category.model'
import { BadRequestException } from '@root/app/exception/httpException'
import { httpFlags } from '@root/constant/flags'

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  public async findAllCategory() {
    return this.categoryRepository.getAllCategory()
  }

  public async findOneCategory(id: string) {
    const category = this.categoryRepository.getCategoryById(id)
    if (category) {
      return category
    } else {
      throw new BadRequestException(httpFlags.CATEGORY_NOT_FOUND)
    }
  }

  public async createCategory(data: ICategory) {
    const categoryIsExist = this.categoryRepository.getCategoryByName(data.name)
    if (categoryIsExist) throw new BadRequestException(httpFlags.CATEGORY_IS_ALREADY_EXIST)
    return this.categoryRepository.createCategory(data)
  }
}
