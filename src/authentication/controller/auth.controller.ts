import { Controller, Post, Req } from '@nestjs/common'
import { UserService } from '@root/services/user.service'
import { BaseController } from '@root/controller/base.controller'

import { Request } from 'express'

@Controller('auth')
export class AuthController extends BaseController {
  constructor(private readonly userService: UserService) {
    super()
  }

  @Post('register')
  async signUp(@Req() req: Request) {
    await this.validateRequest(req, BaseController.schemas.userSchema.postUser)
    return this.userService.createUser(req.body)
  }
}
