import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/db";
import { Organization } from "@/models/Organization";
import { User } from "@/models/User";
import { Asset } from "@/models/Asset";
import { Booking } from "@/models/Booking";

const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET!);

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("admin_session")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret());
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const orgs = await Organization.find().lean();
  const orgIds = orgs.map((o) => o._id);

  const [users, assets, bookings] = await Promise.all([
    User.find({ orgId: { $in: orgIds } }).lean(),
    Asset.find({ orgId: { $in: orgIds } }).lean(),
    Booking.find({ orgId: { $in: orgIds } }).lean(),
  ]);

  const result = orgs.map((org) => {
    const orgUsers = users.filter((u) => String(u.orgId) === String(org._id));
    const orgAssets = assets.filter((a) => String(a.orgId) === String(org._id));
    const orgBookings = bookings.filter((b) => String(b.orgId) === String(org._id));
    return {
      id: String(org._id),
      name: org.name,
      plan: org.plan,
      trialStartDate: org.trialStartDate,
      createdAt: org.createdAt,
      userCount: orgUsers.length,
      assetCount: orgAssets.length,
      bookingCount: orgBookings.length,
      users: orgUsers.map((u) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role,
        blacklisted: u.blacklisted ?? false,
        createdAt: u.createdAt,
        avatarUrl: u.avatarUrl,
      })),
    };
  });

  return NextResponse.json(result);
}
