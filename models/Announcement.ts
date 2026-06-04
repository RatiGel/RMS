import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  body: string;
  target: "all" | "plan" | "tenant";
  planTarget?: "trial" | "starter" | "pro";
  tenantId?: Types.ObjectId;
  startsAt: Date;
  endsAt: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    target: { type: String, enum: ["all", "plan", "tenant"], required: true },
    planTarget: { type: String, enum: ["trial", "starter", "pro"] },
    tenantId: { type: Schema.Types.ObjectId, ref: "Organization" },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

AnnouncementSchema.index({ startsAt: 1, endsAt: 1 });

export const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement || mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);
