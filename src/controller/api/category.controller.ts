import { Controller, Get, Param, Req, Post } from '@nestjs/common'
import { CategoryService } from '@root/services/category.service'
import { BadRequestException } from '@root/app/exception/httpException'
import { httpFlags } from '@root/constant/flags'
import { BaseController } from '@root/controller/base.controller'

import { Request } from 'express'
import mongoose from 'mongoose'

@Controller('category')
export class CategoryController extends BaseController {
  constructor(private readonly categoryService: CategoryService) {
    super()
  }

  @Get()
  async getAll(@Req() req: Request) {
    await this.validateRequest(req, BaseController.schemas.categorySchema.getCategory)
    return this.categoryService.findAllCategory()
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    const isValidID = mongoose.Types.ObjectId.isValid(id)
    if (isValidID) {
      return this.categoryService.findOneCategory(id)
    } else {
      throw new BadRequestException(httpFlags.INVALID_PARAM)
    }
  }

  @Post('/create')
  async createOne(@Req() req: Request) {
    await this.validateRequest(req, BaseController.schemas.categorySchema.createCategory)
    return this.categoryService.createCategory(req.body)
  }
}
