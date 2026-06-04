"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { createSession, deleteSession, getSession } from "@/app/lib/session";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Organization } from "@/models/Organization";
import { AuditLog } from "@/models/AuditLog";
import { verifyTotp } from "@/app/lib/totp";

const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function superAdminLogout() {
  await deleteSession();
  redirect("/super-admin/login");
}

export async function verifyMfa(
  state: { message?: string } | undefined,
  formData: FormData
): Promise<{ message?: string }> {
  const code = (formData.get("code") as string | null)?.trim() ?? "";
  const cookieStore = await cookies();
  const pendingToken = cookieStore.get("sa_mfa_pending")?.value;

  if (!pendingToken) {
    return { message: "Session expired. Please log in again." };
  }

  let userId: string;
  try {
    const { payload } = await jwtVerify(pendingToken, secret());
    userId = payload.userId as string;
  } catch {
    return { message: "Session expired. Please log in again." };
  }

  await connectDB();
  const user = await User.findById(userId);
  if (!user || user.role !== "super_admin") {
    return { message: "Access denied." };
  }

  // Allow bypass in development via env var
  const bypass = process.env.SUPER_ADMIN_BYPASS_MFA === "true" && process.env.NODE_ENV !== "production";
  const bypassCode = process.env.SUPER_ADMIN_MFA_PIN;

  const valid =
    bypass ||
    (bypassCode && code === bypassCode) ||
    (user.mfaSecret && verifyTotp(user.mfaSecret, code));

  if (!valid) {
    return { message: "Invalid authentication code." };
  }

  cookieStore.delete("sa_mfa_pending");

  await User.findByIdAndUpdate(userId, { lastLoginAt: new Date() });

  await createSession({
    userId: String(user._id),
    orgId: "",
    role: "super_admin",
    name: user.name,
    orgName: "Super Admin",
  });

  redirect("/super-admin");
}

export async function exitImpersonation() {
  const cookieStore = await cookies();
  const realToken = cookieStore.get("sa_real_session")?.value;

  if (realToken) {
    // Restore super admin session
    cookieStore.set("rms_session", realToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    // Log exit
    try {
      const { payload } = await jwtVerify(realToken, secret());
      const adminId = payload.userId as string;
      const adminName = payload.name as string;
      const impData = cookieStore.get("sa_impersonating")?.value;
      if (impData) {
        const { orgId, orgName } = JSON.parse(impData);
        await connectDB();
        await AuditLog.create({
          adminId,
          adminName,
          action: "impersonation_end",
          targetType: "impersonation",
          targetId: orgId,
          targetName: orgName,
        });
      }
    } catch { /* non-critical */ }
  }

  cookieStore.delete("sa_real_session");
  cookieStore.delete("sa_impersonating");

  redirect("/super-admin/tenants");
}

export async function setupMfa(
  state: { message?: string; secret?: string; uri?: string } | undefined
): Promise<{ message?: string; secret?: string; uri?: string }> {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return { message: "Unauthorized." };
  }

  const { generateMfaSecret, getTotpUri } = await import("@/app/lib/totp");
  await connectDB();
  const user = await User.findById(session.userId);
  if (!user) return { message: "User not found." };

  if (user.mfaSecret) {
    return { message: "MFA already configured. Disable it first." };
  }

  const newSecret = generateMfaSecret();
  await User.findByIdAndUpdate(session.userId, { mfaSecret: newSecret });

  return {
    secret: newSecret,
    uri: getTotpUri(newSecret, user.email),
  };
}
