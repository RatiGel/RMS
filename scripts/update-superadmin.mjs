import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env.local") });

const UserSchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId },
  name: String,
  email: { type: String, lowercase: true, trim: true },
  passwordHash: String,
  role: String,
  blacklisted: { type: Boolean, default: false },
  superAdminRole: String,
  mfaSecret: String,
  lastLoginAt: Date,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const TARGET_EMAIL = "ratige12@gmail.com";
const NEW_PASSWORD = "Rat1G1994$";

await mongoose.connect(process.env.MONGODB_URI);
console.log("Connected to MongoDB");

// Remove old placeholder superadmin if exists
await User.deleteOne({ email: "superadmin@rms.local" });
console.log("Removed placeholder superadmin@rms.local");

// Find the real user
const user = await User.findOne({ email: TARGET_EMAIL });
if (!user) {
  console.error(`No user found with email: ${TARGET_EMAIL}`);
  process.exit(1);
}

console.log(`Found user: ${user.name} (current role: ${user.role}, orgId: ${user.orgId})`);

const passwordHash = await bcrypt.hash(NEW_PASSWORD, 12);

await User.updateOne(
  { email: TARGET_EMAIL },
  {
    role: "super_admin",
    superAdminRole: "owner",
    passwordHash,
    // keep orgId — needed for dashboard switching
  }
);

console.log(`\n✓ Updated ${TARGET_EMAIL} to super_admin`);
console.log(`  OrgId preserved: ${user.orgId}`);
console.log("\nLogin at: http://localhost:3000/super-admin/login");
console.log(`  Email:    ${TARGET_EMAIL}`);
console.log(`  Password: ${NEW_PASSWORD}`);
console.log("  MFA:      enter any 6 digits (bypass active)\n");

await mongoose.disconnect();
