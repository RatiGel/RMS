import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type PaymentMethod = "cash" | "bank_transfer" | "card" | "other";

export interface IPayment extends Document {
  orgId: Types.ObjectId;
  invoiceId: Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  paidAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", required: true },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ["cash", "bank_transfer", "card", "other"],
      required: true,
    },
    paidAt: { type: Date, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

PaymentSchema.index({ orgId: 1, invoiceId: 1 });

export const Payment: Model<IPayment> =
  mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);
