import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (token && pathname === "/signin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!token) {
    if (pathname === "/signin") return NextResponse.next();
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  if (token.role === "NONE") {
    if (req.nextUrl.pathname === "/no-access") return NextResponse.next();
    return NextResponse.redirect(new URL("/no-access", req.url));
  }

  if (pathname === "/") {
    switch (token.role) {
      case "ADMIN":
        return NextResponse.redirect(new URL("/admin", req.url));
      case "QC":
        return NextResponse.redirect(new URL("/qc", req.url));
      case "SME":
        return NextResponse.redirect(new URL("/sme", req.url));
      default:
        return NextResponse.redirect(new URL("/no-access", req.url));
    }
  }

  if (pathname.includes("/admin") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (pathname.includes("/qc") && token.role !== "QC") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (pathname.includes("/sme") && token.role !== "SME") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
