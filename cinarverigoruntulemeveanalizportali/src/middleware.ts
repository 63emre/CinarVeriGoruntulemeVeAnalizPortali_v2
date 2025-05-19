import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

// Paths that don't require authentication
const publicPaths = ['/auth/login', '/auth/register', '/api/auth/login', '/api/auth/register'];

// JWT Secret - should match the one used for token generation
const JWT_SECRET = process.env.JWT_SECRET || 'cinar-secret-key-123456789';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is public
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Check if the path is an API route that doesn't need auth
  if (pathname.startsWith('/api/auth/') && !pathname.includes('/api/auth/me')) {
    return NextResponse.next();
  }

  // Get the token from cookies
  const token = request.cookies.get('token')?.value;
  
  // If no token, redirect to login
  if (!token) {
    const url = new URL('/auth/login', request.url);
    return NextResponse.redirect(url);
  }
  
  try {
    // Verify the token
    verify(token, JWT_SECRET);
    
    // If the token is valid, allow the request and add security headers
    const response = NextResponse.next();
    
    // Add Content Security Policy headers
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'"
    );
    
    // Add other security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    return response;
  } catch (e) {
    // If the token is invalid, redirect to login
    console.error('Invalid token:', e);
    const url = new URL('/auth/login', request.url);
    return NextResponse.redirect(url);
  }
}

// Configure the paths that should be checked for authentication
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg).*)',
  ],
}; 