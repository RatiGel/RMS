import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Asset } from "@/models/Asset";
import { Category } from "@/models/Category";
import { Organization } from "@/models/Organization";
import { getSession } from "@/app/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json([]);

  await connectDB();

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const categoryId = searchParams.get("categoryId");

  const filter: Record<string, unknown> = { orgId: session.orgId };
  if (status) filter.status = status;
  if (categoryId) filter.categoryId = categoryId;

  const assets = await Asset.find(filter).sort({ createdAt: -1 });

  const categories = await Category.find({ orgId: session.orgId });
  const catMap = Object.fromEntries(categories.map((c) => [String(c._id), c.name]));

  const data = assets.map((a) => ({
    id: String(a._id),
    name: a.name,
    categoryId: String(a.categoryId),
    categoryName: catMap[String(a.categoryId)] ?? "Unknown",
    dailyRate: a.dailyRate,
    depositAmount: a.depositAmount,
    status: a.status,
    description: a.description,
    imageUrl: a.imageUrl,
    serialNumber: a.serialNumber,
    createdAt: a.createdAt.toISOString(),
  }));

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role === "staff") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();

  // Enforce plan asset limits
  const org = await Organization.findById(session.orgId).lean() as {
    plan?: string;
    trialStartDate?: Date;
  } | null;
  const plan = org?.plan ?? "trial";

  if (plan === "starter") {
    const assetCount = await Asset.countDocuments({ orgId: session.orgId });
    if (assetCount >= 20) {
      return NextResponse.json(
        { error: "Asset limit reached", code: "PLAN_LIMIT", limit: 20, plan },
        { status: 402 }
      );
    }
  }

  const body = await req.json();
  const asset = await Asset.create({ ...body, orgId: session.orgId });
  const category = await Category.findById(asset.categoryId);

  return NextResponse.json(
    {
      id: String(asset._id),
      name: asset.name,
      categoryId: String(asset.categoryId),
      categoryName: category?.name ?? "Unknown",
      dailyRate: asset.dailyRate,
      depositAmount: asset.depositAmount,
      status: asset.status,
      description: asset.description,
      imageUrl: asset.imageUrl,
      serialNumber: asset.serialNumber,
      createdAt: asset.createdAt.toISOString(),
    },
    { status: 201 }
  );
}
