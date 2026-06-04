import mongoose, { Schema, Document, Model } from "mongoose";

export type FeatureName = "telegram_bot" | "ai_assistant" | "dynamic_pricing" | "damage_detection";

export interface IFeatureFlag extends Document {
  featureName: FeatureName;
  enabledGlobally: boolean;
  tenantOverrides: Map<string, boolean>;
  updatedAt: Date;
}

const FeatureFlagSchema = new Schema<IFeatureFlag>(
  {
    featureName: {
      type: String,
      enum: ["telegram_bot", "ai_assistant", "dynamic_pricing", "damage_detection"],
      required: true,
      unique: true,
    },
    enabledGlobally: { type: Boolean, default: false },
    tenantOverrides: { type: Map, of: Boolean, default: {} },
  },
  { timestamps: true }
);

export const FeatureFlag: Model<IFeatureFlag> =
  mongoose.models.FeatureFlag || mongoose.model<IFeatureFlag>("FeatureFlag", FeatureFlagSchema);
