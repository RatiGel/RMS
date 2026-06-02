"use server";

import { redirect } from "next/navigation";
import { createAdminSession, deleteAdminSession } from "@/app/lib/admin-session";

export async function adminLogin(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const password = formData.get("password") as string;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return { error: "Invalid password." };
  }

  await createAdminSession();
  redirect("/admin");
}

export async function adminLogout() {
  await deleteAdminSession();
  redirect("/admin/login");
}
