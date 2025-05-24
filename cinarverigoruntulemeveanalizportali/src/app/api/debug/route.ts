import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Check current user
    const currentUser = await getCurrentUser();
    
    // Get raw cookie info
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    return NextResponse.json({
      authenticated: !!currentUser,
      user: currentUser,
      hasToken: !!token,
      tokenLength: token?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug route error:', error);
    return NextResponse.json(
      { 
        error: 'Debug failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 