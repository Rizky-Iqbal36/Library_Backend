import { Controller, Get, Param, Patch, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'

import { CloudinaryService } from '@root/services/cloudinary.service'
import { UserService } from '@root/services/user.service'
import { BadRequestException } from '@root/app/exception/httpException'
import { httpFlags } from '@root/constant/flags'
import { BaseController } from '@root/controller/base.controller'
import { AdminGuard } from '@root/app/guard/admin.guard'

import { Request } from 'express'
import mongoose from 'mongoose'

@Controller('user')
export class UserController extends BaseController {
  constructor(private readonly userService: UserService, private readonly cloudinaryService: CloudinaryService) {
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
  async uploadAvatar(@UploadedFile() avatar: Express.Multer.File, @Param('id') id: string, @Req() req: Request) {
    console.log(id)
    console.log(req.body)
    return { message: 'avatar has been uploaded', filename: avatar.originalname }
  }
}
