import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { decrypt } from "@/app/lib/session";
import { cookies } from "next/headers";

const publicRoutes = ["/login", "/register"];
const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET!);

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Admin route protection
  if (path.startsWith("/admin") && path !== "/admin/login") {
    const token = req.cookies.get("admin_session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    try {
      await jwtVerify(token, secret());
    } catch {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // Redirect authenticated users away from login/register
  const isPublic = publicRoutes.includes(path);
  if (isPublic) {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("rms_session")?.value;
    const session = await decrypt(sessionToken);
    if (session?.userId) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
