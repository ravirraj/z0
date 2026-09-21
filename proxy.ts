import { type NextRequest, NextResponse } from "next/server";
import { isDevelopmentEnvironment } from "./lib/constants";

const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIE_NAMES.some((name) => request.cookies.has(name));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /*
   * Playwright starts the dev server and requires a 200 status to
   * begin the tests, so this ensures that the tests can start
   */
  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check for required environment variables
  if (!(process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET)) {
    console.error(
      "❌ Missing BETTER_AUTH_SECRET environment variable. Please check your .env file.",
    );
    return NextResponse.next(); // Let the app handle the error with better UI
  }

  const isSignedIn = hasSessionCookie(request);

  if (!isSignedIn) {
    // Allow API routes to proceed without authentication for anonymous chat creation
    if (pathname.startsWith("/api/")) {
      return NextResponse.next();
    }

    // Allow homepage for anonymous users
    if (pathname === "/") {
      return NextResponse.next();
    }

    // Redirect protected pages to login
    if (["/chats", "/projects"].some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Allow login and register pages
    if (["/login", "/register"].includes(pathname)) {
      return NextResponse.next();
    }

    // For any other protected routes, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (["/login", "/register"].includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/chats/:path*",
    "/projects/:path*",
    "/api/:path*",
    "/login",
    "/register",

    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
