import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth/auth';

export async function POST(request: Request) {
  try {
    console.log('Login API called');
    
    let body;
    try {
      body = await request.json();
      console.log('Request body parsed:', { email: body.email, hasPassword: !!body.password });
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { message: 'Geçersiz istek formatı.' },
        { status: 400 }
      );
    }
    
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      console.log('Validation failed: missing email or password');
      return NextResponse.json(
        { message: 'Email ve şifre gereklidir.' },
        { status: 400 }
      );
    }

    // Find user by email
    console.log('Finding user with email:', email);
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('User not found with email:', email);
      return NextResponse.json(
        { message: 'Geçersiz kullanıcı bilgileri.' },
        { status: 401 }
      );
    }
    
    console.log('User found:', { id: user.id, email: user.email, role: user.role });

    // Verify password
    console.log('Verifying password');
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      console.log('Password verification failed');
      return NextResponse.json(
        { message: 'Geçersiz kullanıcı bilgileri.' },
        { status: 401 }
      );
    }
    
    console.log('Password verified successfully');

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name || '',
      role: user.role,
    });
    
    console.log('JWT token generated');

    // Create response
    const responseData = {
      message: 'Giriş başarılı',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
    
    console.log('Creating response with user data');
    const response = NextResponse.json(responseData);

    // Set token in cookies using NextResponse
    console.log('Setting token in cookies');
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    
    console.log('Login successful, returning response');
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 