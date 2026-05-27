import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type InvoiceStatus = "unpaid" | "partial" | "paid" | "overdue";

export interface ILineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IInvoice extends Document {
  orgId: Types.ObjectId;
  invoiceNumber: string;
  bookingId: Types.ObjectId;
  customerId: Types.ObjectId;
  lineItems: ILineItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  dueDate: Date;
  paidAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const LineItemSchema = new Schema<ILineItem>(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    invoiceNumber: { type: String, required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    lineItems: [LineItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["unpaid", "partial", "paid", "overdue"],
      default: "unpaid",
    },
    dueDate: { type: Date, required: true },
    paidAmount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

InvoiceSchema.index({ orgId: 1, status: 1 });
InvoiceSchema.index({ orgId: 1, invoiceNumber: 1 }, { unique: true });

export const Invoice: Model<IInvoice> =
  mongoose.models.Invoice ||
  mongoose.model<IInvoice>("Invoice", InvoiceSchema);
