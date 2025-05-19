import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    console.log('GET /api/auth/me called');
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('No user found in token');
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }
    
    console.log('User found in token:', user.id);

    // Fetch additional user details from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!dbUser) {
      console.log('User not found in database:', user.id);
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }
    
    console.log('User details retrieved successfully');
    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 