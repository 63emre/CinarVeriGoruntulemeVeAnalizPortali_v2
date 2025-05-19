import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

// Paths that don't require authentication
const publicPaths = [
  '/',
  '/auth/login', 
  '/auth/register', 
  '/api/auth/login', 
  '/api/auth/register'
];

// JWT Secret - should match the one used for token generation
const JWT_SECRET = process.env.JWT_SECRET || 'cinar-secret-key-123456789';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('Middleware checking path:', pathname);
  
  // Check if the path is public
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path))) {
    console.log('Path is public, allowing access');
    return NextResponse.next();
  }
  
  // Check if the path is an API route that doesn't need auth
  if (pathname.startsWith('/api/auth/') && !pathname.includes('/api/auth/me')) {
    console.log('Path is a non-me auth API route, allowing access');
    return NextResponse.next();
  }
  
  // Public assets should not be checked
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/fonts/') ||
    pathname.includes('.svg') ||
    pathname.includes('.png') ||
    pathname.includes('.jpg') ||
    pathname.includes('.ico')
  ) {
    console.log('Path is a public asset, allowing access');
    return NextResponse.next();
  }

  // Get the token from cookies
  const token = request.cookies.get('token')?.value;
  
  // If no token, redirect to login
  if (!token) {
    console.log('No token found, path requires authentication');
    // If it's an API request, return 401 Unauthorized
    if (pathname.startsWith('/api/')) {
      console.log('API request without token, returning 401');
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }
    
    // For non-API routes, redirect to login
    console.log('Redirecting to login page');
    const url = new URL('/auth/login', request.url);
    return NextResponse.redirect(url);
  }
  
  try {
    // Verify token
    verify(token, JWT_SECRET);
    console.log('Token verified successfully for path:', pathname);
    return NextResponse.next();
  } catch (error) {
    console.error('Token verification failed:', error);
    // If token is invalid and it's an API request, return 401
    if (pathname.startsWith('/api/')) {
      console.log('API request with invalid token, returning 401');
      return NextResponse.json(
        { message: 'Geçersiz veya süresi dolmuş token' },
        { status: 401 }
      );
    }
    
    // For non-API routes with invalid token, redirect to login
    console.log('Redirecting to login page due to invalid token');
    const url = new URL('/auth/login', request.url);
    return NextResponse.redirect(url);
  }
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. /images/*)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 