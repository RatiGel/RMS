import mongoose, { Schema, Document, Model } from "mongoose";

export interface PlanConfig {
  id: string;
  name: string;
  price: number;
  maxAssets: number | null;
  maxBookingsPerMonth: number | null;
  userSeats: number | null;
  trialDays?: number;
  features: string[];
}

export interface IPlatformSettings extends Document {
  languages: string[];
  currencies: string[];
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maintenanceScheduledAt?: Date;
  platformName: string;
  logoUrl?: string;
  planConfigs?: PlanConfig[];
  updatedAt: Date;
}

const PlatformSettingsSchema = new Schema<IPlatformSettings>(
  {
    languages: { type: [String], default: ["en", "ka", "ru"] },
    currencies: { type: [String], default: ["GEL", "USD", "EUR"] },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: "Platform is under maintenance. Please check back shortly." },
    maintenanceScheduledAt: { type: Date },
    platformName: { type: String, default: "RMS" },
    logoUrl: { type: String },
    planConfigs: { type: [Schema.Types.Mixed] },
  },
  { timestamps: true }
);

export const PlatformSettings: Model<IPlatformSettings> =
  mongoose.models.PlatformSettings ||
  mongoose.model<IPlatformSettings>("PlatformSettings", PlatformSettingsSchema);
