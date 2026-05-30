import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { Asset } from "@/models/Asset";
import { getSession } from "@/app/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json([]);

  await connectDB();

  const categories = await Category.find({ orgId: session.orgId }).sort({ name: 1 });
  const counts = await Asset.aggregate([
    { $match: { orgId: categories[0]?.orgId } },
    { $group: { _id: "$categoryId", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));

  return NextResponse.json(
    categories.map((c) => ({
      id: String(c._id),
      name: c.name,
      description: c.description,
      assetCount: countMap[String(c._id)] ?? 0,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role === "staff") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();

  const body = await req.json();
  const category = await Category.create({ ...body, orgId: session.orgId });

  return NextResponse.json(
    { id: String(category._id), name: category.name, description: category.description, assetCount: 0 },
    { status: 201 }
  );
}
