import { Document, model, Schema } from 'mongoose'

export interface IMessage {
  conversationId?: string
  senderId?: string
  text?: string
}

export type IMessageDoc = IMessage & Document

const messageSchema = new Schema(
  {
    conversationId: { type: String, required: true },
    senderId: { type: String, required: true },
    text: { type: String }
  },
  { timestamps: true }
)

export const MessageModel = model<IMessageDoc>('Message', messageSchema, 'messages')
