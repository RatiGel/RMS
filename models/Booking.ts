import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type BookingStatus =
  | "draft"
  | "confirmed"
  | "active"
  | "returned"
  | "cancelled";

export interface IBooking extends Document {
  orgId: Types.ObjectId;
  assetId: Types.ObjectId;
  customerId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: BookingStatus;
  totalAmount: number;
  depositAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    assetId: { type: Schema.Types.ObjectId, ref: "Asset", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["draft", "confirmed", "active", "returned", "cancelled"],
      default: "draft",
    },
    totalAmount: { type: Number, required: true, min: 0 },
    depositAmount: { type: Number, required: true, min: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

BookingSchema.index({ orgId: 1, status: 1 });
BookingSchema.index({ orgId: 1, assetId: 1, startDate: 1, endDate: 1 });

export const Booking: Model<IBooking> =
  mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", BookingSchema);
