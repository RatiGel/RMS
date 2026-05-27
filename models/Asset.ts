import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type AssetStatus = "available" | "rented" | "maintenance" | "retired";

export interface IAsset extends Document {
  orgId: Types.ObjectId;
  categoryId: Types.ObjectId;
  name: string;
  dailyRate: number;
  depositAmount: number;
  status: AssetStatus;
  description: string;
  imageUrl?: string;
  serialNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssetSchema = new Schema<IAsset>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    name: { type: String, required: true, trim: true },
    dailyRate: { type: Number, required: true, min: 0 },
    depositAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["available", "rented", "maintenance", "retired"],
      default: "available",
    },
    description: { type: String, default: "" },
    imageUrl: { type: String },
    serialNumber: { type: String },
  },
  { timestamps: true }
);

AssetSchema.index({ orgId: 1, status: 1 });

export const Asset: Model<IAsset> =
  mongoose.models.Asset || mongoose.model<IAsset>("Asset", AssetSchema);
