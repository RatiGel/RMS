import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICustomer extends Document {
  orgId: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  address: string;
  idType: "passport" | "national_id" | "drivers_license";
  idNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    address: { type: String, default: "" },
    idType: {
      type: String,
      enum: ["passport", "national_id", "drivers_license"],
      required: true,
    },
    idNumber: { type: String, required: true },
  },
  { timestamps: true }
);

CustomerSchema.index({ orgId: 1 });

export const Customer: Model<ICustomer> =
  mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);
