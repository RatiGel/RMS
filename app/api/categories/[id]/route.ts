import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { getSession } from "@/app/lib/session";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await connectDB();

  const body = await req.json();
  const cat = await Category.findOneAndUpdate(
    { _id: id, orgId: session.orgId },
    body,
    { new: true }
  );
  if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ id: String(cat._id), name: cat.name, description: cat.description });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await connectDB();

  const cat = await Category.findOneAndDelete({ _id: id, orgId: session.orgId });
  if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
