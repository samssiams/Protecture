import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const token = await getToken({ req });

  // Define the paths that require authentication
  const protectedPaths = ['/home', '/about', '/profile', '/']; // Added '/' for index

  // Check if the user is trying to access a protected path
  if (protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
    // If the token is not present or it does not have an ID (user is not authenticated)
    if (!token || !token.id) {
      // Log the error for debugging purposes
      console.log(`Redirecting to login because no valid token found for path: ${req.nextUrl.pathname}`);

      // Redirect the user to the login page
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/auth/login';

      // Optionally, you can store the current URL in the query so the user can be redirected back after logging in
      loginUrl.searchParams.set('redirect', req.nextUrl.pathname);

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
