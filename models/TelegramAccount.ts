import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ITelegramAccount extends Document {
  orgId: Types.ObjectId;
  telegramChatId: string;
  telegramUsername?: string;
  linkedBy: Types.ObjectId;
  linkedAt: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TelegramAccountSchema = new Schema<ITelegramAccount>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    telegramChatId: { type: String, required: true },
    telegramUsername: { type: String },
    linkedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    linkedAt: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TelegramAccountSchema.index({ orgId: 1 });
TelegramAccountSchema.index({ telegramChatId: 1 });

export const TelegramAccount: Model<ITelegramAccount> =
  mongoose.models.TelegramAccount ||
  mongoose.model<ITelegramAccount>("TelegramAccount", TelegramAccountSchema);
