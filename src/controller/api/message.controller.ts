import { Controller, Post, Req, Get, Param, UseGuards } from '@nestjs/common'

import { RateThrottlerGuard } from '@app/guard/rateThrottler.guard'

import { ChatServie } from '@root/services/chat.service'
import { BaseController } from '@root/controller/base.controller'

import { Request } from 'express'

@Controller('message')
export class MessageController extends BaseController {
  constructor(private readonly chatServie: ChatServie) {
    super()
  }

  @Post()
  @UseGuards(RateThrottlerGuard)
  async createMessage(@Req() req: Request) {
    return this.chatServie.createMessage(req.body)
  }

  @Get('/:id')
  async getMessages(@Param('id') id: string) {
    return this.chatServie.getMessages(id)
  }
}
