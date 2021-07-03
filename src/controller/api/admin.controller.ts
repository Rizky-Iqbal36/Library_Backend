import { Controller, Get, Param, Req, Put, Post, Patch, UseGuards, Delete } from '@nestjs/common'

import { UserService } from '@root/services/user.service'
import { BookService } from '@root/services/book.service'
import { CategoryService } from '@root/services/category.service'

import { BadRequestException } from '@root/app/exception/httpException'
import { httpFlags } from '@root/constant/flags'
import { BaseController } from '@root/controller/base.controller'
import { AdminGuard } from '@root/app/guard/admin.guard'

import { Request } from 'express'
import mongoose from 'mongoose'

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController extends BaseController {
  constructor(
    private readonly userService: UserService,
    private readonly bookService: BookService,
    private readonly categoryService: CategoryService
  ) {
    super()
  }

  //User API
  @Get('get-users')
  async getAll(@Req() req: Request) {
    await this.validateRequest(req, BaseController.schemas.userSchema.getUsers)
    const page = parseInt(req.query.page as any) || 1
    return this.userService.findAllUser(page)
  }

  @Get('get-user/:id')
  async getOne(@Param('id') id: string) {
    const isValidID = mongoose.Types.ObjectId.isValid(id)
    if (isValidID) {
      return this.userService.findOneUser(id)
    } else {
      throw new BadRequestException(httpFlags.INVALID_PARAM)
    }
  }

  @Delete('/:id')
  async deleteOne(@Param('id') id: string) {
    const isValidID = mongoose.Types.ObjectId.isValid(id)
    if (isValidID) {
      return this.userService.deleteUser(id)
    } else {
      throw new BadRequestException(httpFlags.INVALID_PARAM)
    }
  }

  @Patch('/:id')
  async blockUser(@Param('id') id: string, @Req() req: Request) {
    await this.validateRequest(req, BaseController.schemas.userSchema.blockUser)
    const isValidID = mongoose.Types.ObjectId.isValid(id)

    const { setActive, setStatus } = req.query as any
    if (isValidID) {
      return this.userService.blockUser(id, (setActive as unknown) as boolean, setStatus)
    } else {
      throw new BadRequestException(httpFlags.INVALID_PARAM)
    }
  }

  //Book API
  @Put('approve-book/:id')
  async bookApprover(@Param('id') id: string, @Req() req: Request) {
    await this.validateRequest(req, BaseController.schemas.bookSchema.approveBook)
    const isValidID = mongoose.Types.ObjectId.isValid(id)
    if (isValidID) {
      return this.bookService.bookApprover(id, req.body)
    } else {
      throw new BadRequestException(httpFlags.INVALID_PARAM)
    }
  }

  //Category API
  @Post('/create-category')
  async createOne(@Req() req: Request) {
    await this.validateRequest(req, BaseController.schemas.categorySchema.createCategory)
    return this.categoryService.createCategory(req.body)
  }
}
