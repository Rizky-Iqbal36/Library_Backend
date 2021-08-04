import { Injectable } from '@nestjs/common'
import { CategoryRepository } from '@root/repositories/category.repository'
import { ICategory } from '@root/database/models/category.model'
import { BadRequestException, NotFoundException } from '@root/app/exception/httpException'
import { httpFlags } from '@root/constant/flags'

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  public async findAllCategory() {
    return this.categoryRepository.getAllCategory()
  }

  public async findOneCategory(id: string) {
    const category = await this.categoryRepository.getCategoryById(id)
    if (category) {
      if (!category.isActive)
        throw new BadRequestException(httpFlags.CATEGORY_IS_INACTIVE, { localeMessage: { key: 'INACTIVE_CATEGORY' } })
      return category
    } else {
      throw new NotFoundException(httpFlags.CATEGORY_NOT_FOUND, {
        localeMessage: { key: 'CATEGORY_NOT_FOUND', vars: { categoryId: id } }
      })
    }
  }

  public async createCategory(data: ICategory) {
    const categoryIsExist = await this.categoryRepository.getCategoryByName(data.name)

    if (categoryIsExist)
      throw new BadRequestException(httpFlags.CATEGORY_IS_ALREADY_EXIST, { localeMessage: { key: 'CATEGORY_EXIST' } })

    const createdCategory = await this.categoryRepository.createCategory(data)
    return {
      message: 'New category succesfully created',
      data: {
        categoryId: createdCategory._id,
        categoryName: createdCategory.name,
        categoryDescription: createdCategory.description
      }
    }
  }
}
