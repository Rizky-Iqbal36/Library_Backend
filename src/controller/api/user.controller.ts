import { Controller, Get, Param, Req } from '@nestjs/common'
import { UserService } from '@root/services/user.service'
import { BadRequestException } from '@root/app/exception/httpException'
import { httpFlags } from '@root/constant/flags'
import { BaseController } from '@root/controller/base.controller'

import { Request } from 'express'
import mongoose from 'mongoose'

@Controller('user')
export class UserController extends BaseController {
  constructor(private readonly userService: UserService) {
    super()
  }

  @Get()
  async getAll(@Req() req: Request) {
    await this.validateRequest(req, BaseController.schemas.userSchema.getUser)
    const { isAdmin } = req.query
    return this.userService.findAllUser((isAdmin as unknown) as boolean)
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    const isValidID = mongoose.Types.ObjectId.isValid(id)
    if (isValidID) {
      return this.userService.findOneUser(id)
    } else {
      throw new BadRequestException(httpFlags.INVALID_PARAM)
    }
  }
}
