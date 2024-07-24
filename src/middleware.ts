import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  const role = token.role as Role;

  if (req.nextUrl.pathname.startsWith("/admin") && role !== Role.ADMIN) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (req.nextUrl.pathname.startsWith("/sme") && role !== Role.SME) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (req.nextUrl.pathname.startsWith("/qc") && role !== Role.QC) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/sme/:path*", "/qc/:path*"],
};
