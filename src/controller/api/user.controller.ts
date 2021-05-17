import { Controller, Get, Param, Patch, Req, UseGuards, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'

import { UserService } from '@root/services/user.service'
import { BadRequestException } from '@root/app/exception/httpException'
import { httpFlags } from '@root/constant/flags'
import { BaseController } from '@root/controller/base.controller'
import { AdminGuard } from '@root/app/guard/admin.guard'

import { CloudStorage } from '@app/utils/cloudinary/cloudinary.provider'

import { Request } from 'express'
import mongoose from 'mongoose'

@Controller('user')
export class UserController extends BaseController {
  constructor(private readonly userService: UserService) {
    super()
  }

  @Get()
  @UseGuards(AdminGuard)
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

  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: CloudStorage,
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match('image')) {
          return cb(new BadRequestException(httpFlags.INVALID_FILETYPE, 'Please select an image file type'), false)
        }
        cb(null, true)
      },
      limits: {
        fileSize: 2 * 1000 * 1000
      }
    })
  )
  @Patch('/:id')
  async uploadAvatar(@Param('id') id: string) {
    return this.userService.updateAvatar(id)
  }
}
