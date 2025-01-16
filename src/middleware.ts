import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login",
      signOut: "/auth/logout",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - api/submissions (submissions endpoints)
     * - api/forms (form data endpoints)
     * - f/[id]/results (form results pages)
     * - s (form submission pages)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|api/submissions|api/forms|f/[^/]+/results|s/[^/]+$|_next/static|_next/image|favicon.ico).*)",
  ],
};
