"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Organization } from "@/models/Organization";
import { User } from "@/models/User";
import { createSession, deleteSession } from "@/app/lib/session";
import {
  SignupFormSchema,
  LoginFormSchema,
  SignupFormState,
  LoginFormState,
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

  await connectDB();

  const user = await User.findOne({ email });
  if (!user) {
    return { message: "Invalid email or password." };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { message: "Invalid email or password." };
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
