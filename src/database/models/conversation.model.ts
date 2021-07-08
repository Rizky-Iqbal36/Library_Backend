import { Document, model, Schema } from 'mongoose'

export interface IConversation {
  members?: string[]
}

export type IConversationDoc = IConversation & Document

const ConversationSchema = new Schema(
  {
    members: [{ type: String }]
  },
  { timestamps: true }
)

export const ConversationModel = model<IConversationDoc>('Conversation', ConversationSchema, 'conversations')
