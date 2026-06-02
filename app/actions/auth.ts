"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Organization } from "@/models/Organization";
import { User } from "@/models/User";
import { Category } from "@/models/Category";
import { createSession, deleteSession } from "@/app/lib/session";
import { createAdminSession } from "@/app/lib/admin-session";
import {
  SignupFormSchema,
  LoginFormSchema,
  JoinFormSchema,
  SignupFormState,
  LoginFormState,
  JoinFormState,
} from "@/app/lib/definitions";

export async function signup(
  state: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const validated = SignupFormSchema.safeParse({
    orgName: formData.get("orgName"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { orgName, name, email, password } = validated.data;

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    return { message: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const org = await Organization.create({ name: orgName });
  const user = await User.create({
    orgId: org._id,
    name,
    email,
    passwordHash,
    role: "owner",
  });

  try {
    const raw = String(formData.get("categories") ?? "[]");
    const names: unknown[] = JSON.parse(raw);
    const valid = names.filter((n): n is string => typeof n === "string" && n.trim().length > 0);
    if (valid.length > 0) {
      await Category.insertMany(valid.map((n) => ({ orgId: org._id, name: n.trim(), description: "" })));
    }
  } catch { /* invalid JSON or DB error — categories are optional */ }

  await createSession({
    userId: String(user._id),
    orgId: String(org._id),
    role: user.role,
    name: user.name,
    orgName: org.name,
  });

  redirect("/dashboard");
}

export async function login(
  state: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const validated = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;

  // Admin shortcut — no DB lookup
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    await createAdminSession();
    redirect("/admin");
  }

  await connectDB();

  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) {
    return { message: "Invalid email or password." };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { message: "Invalid email or password." };
  }

  if (user.blacklisted) {
    return { message: "Your account has been suspended. Contact support." };
  }

  const org = await Organization.findById(user.orgId);

  await createSession({
    userId: String(user._id),
    orgId: String(user.orgId),
    role: user.role,
    name: user.name,
    orgName: org?.name ?? "My Organization",
  });

  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function joinOrg(
  state: JoinFormState,
  formData: FormData
): Promise<JoinFormState> {
  const validated = JoinFormSchema.safeParse({
    inviteCode: formData.get("inviteCode"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { inviteCode, name, email, password } = validated.data;

  await connectDB();

  const org = await Organization.findOne({ inviteCode });
  if (!org) {
    return { message: "Invalid invite code." };
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return { message: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    orgId: org._id,
    name,
    email,
    passwordHash,
    role: "staff",
  });

  await createSession({
    userId: String(user._id),
    orgId: String(org._id),
    role: user.role,
    name: user.name,
    orgName: org.name,
  });

  redirect("/dashboard");
}
