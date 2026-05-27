import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Asset } from "@/models/Asset";
import { Category } from "@/models/Category";
import { getSession } from "@/app/lib/session";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await connectDB();

  const asset = await Asset.findOne({ _id: id, orgId: session.orgId });
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const category = await Category.findById(asset.categoryId);
  return NextResponse.json({
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
  });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await connectDB();

  const body = await req.json();
  const asset = await Asset.findOneAndUpdate(
    { _id: id, orgId: session.orgId },
    body,
    { new: true }
  );
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const category = await Category.findById(asset.categoryId);
  return NextResponse.json({
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
  });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await connectDB();

  const asset = await Asset.findOneAndDelete({ _id: id, orgId: session.orgId });
  if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
