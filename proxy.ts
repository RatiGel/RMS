import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/app/lib/session";
import { cookies } from "next/headers";

const protectedRoutes: string[] = [];
const publicRoutes = ["/login", "/register"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtected = protectedRoutes.some((r) => path.startsWith(r));
  const isPublic = publicRoutes.includes(path);

  const cookieStore = await cookies();
  const token = cookieStore.get("rms_session")?.value;
  const session = await decrypt(token);

  if (isProtected && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isPublic && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
