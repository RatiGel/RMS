import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TelegramAccount } from "@/models/TelegramAccount";
import { verifySuperAdmin } from "@/app/lib/super-admin-dal";

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await connectDB();

  const body = await req.json();
  const account = await TelegramAccount.findByIdAndUpdate(id, body, { new: true });
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: RouteCtx) {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await connectDB();

  const account = await TelegramAccount.findByIdAndDelete(id);
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
