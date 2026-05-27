import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICategory extends Document {
  orgId: Types.ObjectId;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

CategorySchema.index({ orgId: 1 });

export const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);
