import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Remove token cookie
    const cookieStore = await cookies();
    cookieStore.delete('token');

    // Return success response
    return NextResponse.json({
      message: 'Çıkış başarılı',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 