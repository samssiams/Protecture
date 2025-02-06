import { NextResponse } from 'next/server';

export async function middleware(req) {
  return NextResponse.next();
}

// Apply middleware to all routes (or specify your desired matcher)
export const config = {
  matcher: ['/', '/home/:path*', '/about', '/profile/:path*'],
};
