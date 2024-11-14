// middleware.js
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const token = await getToken({ req });

  // Define the protected paths
  const protectedPaths = ['/home', '/about', '/profile', '/'];

  // If the user is trying to access a protected page
  if (protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
    if (!token) {
      // If the token is missing, redirect to the login page
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/auth/login';
      return NextResponse.redirect(loginUrl);
    }
  }

  // Continue with the request if the user is authenticated
  return NextResponse.next();
}

// Apply middleware only to the routes that require authentication
export const config = {
  matcher: ['/home', '/about', '/profile', '/'],
};
