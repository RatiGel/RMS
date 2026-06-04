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
  role: { type: String, enum: ["owner", "admin", "staff", "super_admin"] },
  blacklisted: { type: Boolean, default: false },
  superAdminRole: String,
  mfaSecret: String,
  lastLoginAt: Date,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const EMAIL = "superadmin@rms.local";
const PASSWORD = "SuperAdmin2024!";

await mongoose.connect(process.env.MONGODB_URI);
console.log("Connected to MongoDB");

const existing = await User.findOne({ email: EMAIL });
if (existing) {
  if (existing.role !== "super_admin") {
    await User.updateOne({ email: EMAIL }, { role: "super_admin", superAdminRole: "owner" });
    console.log(`Updated existing user ${EMAIL} to super_admin`);
  } else {
    console.log(`Super admin already exists: ${EMAIL}`);
  }
} else {
  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  await User.create({
    name: "Super Admin",
    email: EMAIL,
    passwordHash,
    role: "super_admin",
    superAdminRole: "owner",
  });
  console.log(`Created super admin: ${EMAIL}`);
}

console.log("\n✓ Login at: http://localhost:3000/super-admin/login");
console.log(`  Email:    ${EMAIL}`);
console.log(`  Password: ${PASSWORD}`);
console.log("  MFA:      bypassed (SUPER_ADMIN_BYPASS_MFA=true)\n");

await mongoose.disconnect();
