import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const token = await getToken({ req }); // Retrieve the authentication token
  const { pathname } = req.nextUrl; // Get the current pathname from the request

  // Define the protected paths
  const protectedPaths = ['/home', '/about', '/profile'];

  // Handle requests to the root route (`/`)
  if (pathname === '/') {
    if (!token) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/auth/login';
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname); // Optional callback URL
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect unauthenticated users trying to access protected paths
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    if (!token) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/auth/login';
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname); // Optional callback URL
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow the request to proceed if the user is authenticated
  return NextResponse.next();
}

// Apply middleware only to the routes that require authentication
export const config = {
  matcher: ['/', '/home/:path*', '/about', '/profile/:path*'], // Match root and nested routes
};
