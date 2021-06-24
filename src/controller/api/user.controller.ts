import { Controller, Get, Param, Patch, Req, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'

import { UserService } from '@root/services/user.service'
import { BadRequestException, UnauthorizedException } from '@root/app/exception/httpException'
import { httpFlags } from '@root/constant/flags'
import { BaseController } from '@root/controller/base.controller'

import { CloudStorage } from '@app/utils/cloudinary/cloudinary.provider'

import { Request } from 'express'
import mongoose from 'mongoose'

@Controller('user')
export class UserController extends BaseController {
  constructor(private readonly userService: UserService) {
    super()
  }

  @Get('/:id')
  async getOne(@Param('id') id: string, @Req() req: Request) {
    const isValidID = mongoose.Types.ObjectId.isValid(id)
    if (isValidID) {
      const userId = req.header('x-user-id')
      if (userId !== id)
        throw new UnauthorizedException(httpFlags.UNAUTHORIZED, "You are not allowed to see other user's data")
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
  async uploadAvatar(@Param('id') id: string, @Req() req: Request) {
    const isValidID = mongoose.Types.ObjectId.isValid(id)
    if (isValidID) {
      const userId = req.header('x-user-id')
      if (userId !== id)
        throw new UnauthorizedException(httpFlags.UNAUTHORIZED, "You are not allowed to change other user's data")
      return this.userService.updateAvatar(id)
    } else {
      throw new BadRequestException(httpFlags.INVALID_PARAM)
    }
  }
}
