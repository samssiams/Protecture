import { NextResponse } from 'next/server';

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Bypass middleware for authentication routes (login, signup, etc.)
  if (pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // Check for a NextAuth session token in cookies.
  // NextAuth uses different cookie names in development and production.
  const token = req.cookies.get('next-auth.session-token') ||
                req.cookies.get('__Secure-next-auth.session-token');

  // If no token exists, redirect to the login page.
  if (!token) {
    const loginUrl = new URL('/auth/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Otherwise, continue.
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/home/:path*', '/about', '/profile/:path*'],
};
