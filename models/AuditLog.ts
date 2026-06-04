import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAuditLog extends Document {
  adminId: Types.ObjectId;
  adminName: string;
  action: string;
  targetType: "tenant" | "admin" | "plan" | "feature" | "announcement" | "settings" | "impersonation";
  targetId?: string;
  targetName?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: { type: Schema.Types.ObjectId, required: true },
    adminName: { type: String, required: true },
    action: { type: String, required: true },
    targetType: {
      type: String,
      enum: ["tenant", "admin", "plan", "feature", "announcement", "settings", "impersonation"],
      required: true,
    },
    targetId: { type: String },
    targetName: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ adminId: 1 });

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
