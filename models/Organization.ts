import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";

export interface IOrganization extends Document {
  name: string;
  inviteCode: string;
  plan: "trial" | "starter" | "pro";
  status: "active" | "suspended";
  trialStartDate: Date;
  trialExtendedTo?: Date;
  planStartDate?: Date;
  billingExempt: boolean;
  country?: string;
  lastLoginAt?: Date;
  suspendedAt?: Date;
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
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    trialStartDate: { type: Date, default: Date.now },
    trialExtendedTo: { type: Date },
    planStartDate: { type: Date },
    billingExempt: { type: Boolean, default: false },
    country: { type: String },
    lastLoginAt: { type: Date },
    suspendedAt: { type: Date },
  },
  { timestamps: true }
);

export const Organization: Model<IOrganization> =
  mongoose.models.Organization ||
  mongoose.model<IOrganization>("Organization", OrganizationSchema);
