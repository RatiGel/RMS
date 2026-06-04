import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type UserRole = "owner" | "admin" | "staff" | "super_admin";

export interface IUser extends Document {
  orgId?: Types.ObjectId;
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  avatarUrl?: string;
  role: UserRole;
  blacklisted: boolean;
  mfaSecret?: string;
  lastLoginAt?: Date;
  superAdminRole?: "owner" | "support";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization" },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    googleId: { type: String },
    avatarUrl: { type: String },
    role: { type: String, enum: ["owner", "admin", "staff", "super_admin"], default: "owner" },
    blacklisted: { type: Boolean, default: false },
    mfaSecret: { type: String },
    lastLoginAt: { type: Date },
    superAdminRole: { type: String, enum: ["owner", "support"] },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
