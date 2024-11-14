// middleware.js
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const token = await getToken({ req });

  // Define the paths that require authentication
  const protectedPaths = ['/home', '/about', '/profile', '/']; // Added '/' for index

  // Check if the user is trying to access a protected path
  if (protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
    // If the token is not present (user is not authenticated)
    if (!token) {
      // Redirect the user to the login page
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/auth/login';
      return NextResponse.redirect(loginUrl);
    }
  }

  // If the user is authenticated or accessing a public page, allow the request to continue
  return NextResponse.next();
}

// Apply middleware to the routes that require authentication
export const config = {
  matcher: ['/home', '/about', '/profile', '/'], // Specify the routes that need authentication
};
