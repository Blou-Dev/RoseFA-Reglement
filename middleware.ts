import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { isAdminRole, OWNER_ROLE } from "@/lib/auth-shared";

export default withAuth(
  function middleware(request) {
    const role = typeof request.nextauth.token?.role === "string" ? request.nextauth.token.role : undefined;

    if (request.nextUrl.pathname.startsWith("/admin/login")) {
      if (isAdminRole(role)) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      return NextResponse.next();
    }

    if (!isAdminRole(role)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (request.nextUrl.pathname.startsWith("/admin/accounts") && role !== OWNER_ROLE) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  },
);

export const config = {
  matcher: ["/admin/:path*"],
};
