import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";

export interface IOrganization extends Document {
  name: string;
  inviteCode: string;
  plan: "trial" | "starter" | "pro";
  trialStartDate: Date;
  planStartDate?: Date;
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
    plan: { type: String, enum: ["trial", "starter", "pro"], default: "trial" },
    trialStartDate: { type: Date, default: Date.now },
    planStartDate: { type: Date },
  },
  { timestamps: true }
);

export const Organization: Model<IOrganization> =
  mongoose.models.Organization ||
  mongoose.model<IOrganization>("Organization", OrganizationSchema);
