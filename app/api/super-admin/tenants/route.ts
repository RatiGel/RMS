import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Organization } from "@/models/Organization";
import { User } from "@/models/User";
import { Asset } from "@/models/Asset";
import { Booking } from "@/models/Booking";
import { verifySuperAdmin, logAudit } from "@/app/lib/super-admin-dal";

export async function GET(req: NextRequest) {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const search = searchParams.get("search") ?? "";
  const plan = searchParams.get("plan") ?? "";
  const status = searchParams.get("status") ?? "";

  const country = searchParams.get("country") ?? "";
  const joinedFrom = searchParams.get("joinedFrom") ?? "";
  const joinedTo = searchParams.get("joinedTo") ?? "";

  const query: Record<string, unknown> = {};
  if (plan) query.plan = plan;
  if (status) query.status = status;
  if (country) query.country = { $regex: country, $options: "i" };
  if (joinedFrom || joinedTo) {
    query.createdAt = {};
    if (joinedFrom) (query.createdAt as Record<string, Date>).$gte = new Date(joinedFrom);
    if (joinedTo) (query.createdAt as Record<string, Date>).$lte = new Date(joinedTo + "T23:59:59Z");
  }

  let orgs = await Organization.find(query).sort({ createdAt: -1 }).lean();

  if (search) {
    const lower = search.toLowerCase();
    const matchingUsers = await User.find({
      email: { $regex: search, $options: "i" },
      role: { $in: ["owner", "admin", "staff"] },
    }).select("orgId").lean();
    const emailOrgIds = new Set(matchingUsers.map((u) => String(u.orgId)));
    orgs = orgs.filter(
      (o) => o.name.toLowerCase().includes(lower) || emailOrgIds.has(String(o._id))
    );
  }

  const total = orgs.length;
  const paginated = orgs.slice((page - 1) * limit, page * limit);
  const orgIds = paginated.map((o) => o._id);

  const [users, assets, bookings] = await Promise.all([
    User.find({ orgId: { $in: orgIds }, role: { $ne: "super_admin" } }).lean(),
    Asset.find({ orgId: { $in: orgIds } }).lean(),
    Booking.find({ orgId: { $in: orgIds } }).lean(),
  ]);

  const result = paginated.map((org) => {
    const orgUsers = users.filter((u) => String(u.orgId) === String(org._id));
    const owner = orgUsers.find((u) => u.role === "owner");
    return {
      id: String(org._id),
      name: org.name,
      plan: org.plan,
      status: org.status,
      country: org.country ?? null,
      billingExempt: org.billingExempt,
      assetCount: assets.filter((a) => String(a.orgId) === String(org._id)).length,
      bookingCount: bookings.filter((b) => String(b.orgId) === String(org._id)).length,
      memberCount: orgUsers.length,
      ownerEmail: owner?.email ?? null,
      lastLoginAt: org.lastLoginAt ?? null,
      createdAt: org.createdAt,
      trialStartDate: org.trialStartDate,
      trialExtendedTo: org.trialExtendedTo ?? null,
      planStartDate: org.planStartDate ?? null,
      suspendedAt: org.suspendedAt ?? null,
    };
  });

  return NextResponse.json({ tenants: result, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await verifySuperAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const body = await req.json();
  const { name, ownerName, ownerEmail, ownerPassword, plan = "trial" } = body;

  if (!name || !ownerName || !ownerEmail || !ownerPassword) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await User.findOne({ email: ownerEmail });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash(ownerPassword, 12);

  const org = await Organization.create({ name, plan });
  const user = await User.create({
    orgId: org._id,
    name: ownerName,
    email: ownerEmail,
    passwordHash,
    role: "owner",
  });

  await logAudit(session, "create_tenant", "tenant", String(org._id), name, {
    ownerEmail,
    plan,
  });

  return NextResponse.json({
    id: String(org._id),
    name: org.name,
    ownerEmail: user.email,
  }, { status: 201 });
}
