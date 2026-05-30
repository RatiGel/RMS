import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";

export interface IOrganization extends Document {
  name: string;
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(5).toString("hex"),
    },
  },
  { timestamps: true }
);

export const Organization: Model<IOrganization> =
  mongoose.models.Organization ||
  mongoose.model<IOrganization>("Organization", OrganizationSchema);
