import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TelegramAccount } from "@/models/TelegramAccount";
import { Organization } from "@/models/Organization";
import { verifySuperAdmin } from "@/app/lib/super-admin-dal";
import { Types } from "mongoose";

export async function GET() {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const accounts = await TelegramAccount.find().sort({ createdAt: -1 }).lean();
  const orgIds = [...new Set(accounts.map((a) => String(a.orgId)))];
  const orgs = await Organization.find({ _id: { $in: orgIds } }).select("name").lean();
  const orgMap = Object.fromEntries(orgs.map((o) => [String(o._id), o.name]));

  return NextResponse.json(
    accounts.map((a) => ({
      id: String(a._id),
      orgId: String(a.orgId),
      orgName: orgMap[String(a.orgId)] ?? "Unknown",
      telegramChatId: a.telegramChatId,
      telegramUsername: a.telegramUsername ?? null,
      active: a.active,
      linkedAt: a.linkedAt,
      createdAt: a.createdAt,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const { orgId, telegramChatId, telegramUsername } = body;

  if (!orgId || !telegramChatId) {
    return NextResponse.json({ error: "orgId and telegramChatId required" }, { status: 400 });
  }

  const account = await TelegramAccount.create({
    orgId: new Types.ObjectId(orgId),
    telegramChatId,
    telegramUsername,
    linkedBy: new Types.ObjectId(session.userId),
  });

  return NextResponse.json({ id: String(account._id) }, { status: 201 });
}
