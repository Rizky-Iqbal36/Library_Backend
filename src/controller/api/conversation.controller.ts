import { Controller, Post, Req, Get, Param } from '@nestjs/common'

import { ChatServie } from '@root/services/chat.service'
import { BaseController } from '@root/controller/base.controller'

import { Request } from 'express'

@Controller('conversation')
export class ConversationController extends BaseController {
  constructor(private readonly chatServie: ChatServie) {
    super()
  }

  @Post()
  async createConversation(@Req() req: Request) {
    const members = [req.body.senderId, req.body.receiverId]
    return this.chatServie.createConversation(members)
  }

  @Get('/:id')
  async getConversation(@Param('id') id: string) {
    return this.chatServie.getConversationsByUserId(id)
  }
}
