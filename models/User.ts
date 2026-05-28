import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type UserRole = "owner" | "admin" | "staff";

export interface IUser extends Document {
  orgId: Types.ObjectId;
  name: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    googleId: { type: String },
    role: { type: String, enum: ["owner", "admin", "staff"], default: "owner" },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
