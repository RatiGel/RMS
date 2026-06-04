import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/app/lib/session";

const publicRoutes = ["/login", "/register"];

function nextWithHeader(req: NextRequest): NextResponse {
  const reqHeaders = new Headers(req.headers);
  reqHeaders.set("x-sa-path", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers: reqHeaders } });
}

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Super admin route protection
  if (path.startsWith("/super-admin")) {
    if (path === "/super-admin/login") {
      const session = await decrypt(req.cookies.get("rms_session")?.value);
      if (session?.role === "super_admin") {
        return NextResponse.redirect(new URL("/super-admin", req.url));
      }
      return nextWithHeader(req);
    }
    const session = await decrypt(req.cookies.get("rms_session")?.value);
    if (!session || session.role !== "super_admin") {
      return NextResponse.redirect(new URL("/super-admin/login", req.url));
    }
    return nextWithHeader(req);
  }

  // Redirect authenticated users away from login/register
  const isPublic = publicRoutes.includes(path);
  if (isPublic) {
    const session = await decrypt(req.cookies.get("rms_session")?.value);
    if (session?.userId) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
