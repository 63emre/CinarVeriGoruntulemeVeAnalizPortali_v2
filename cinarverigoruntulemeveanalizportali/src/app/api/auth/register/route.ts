import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword } from '@/lib/auth/auth';
import { getCurrentUser } from '@/lib/auth/auth';

// Register a new user
export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
      console.log('Register request body:', { email: body.email, name: body.name, hasPassword: !!body.password });
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { message: 'Geçersiz istek formatı.' },
        { status: 400 }
      );
    }

    const { name, email, password, role } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'Ad, e-posta ve şifre gereklidir.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Bu e-posta adresi zaten kullanılıyor.' },
        { status: 400 }
      );
    }

    // Only admins can create admin accounts
    if (role === 'ADMIN') {
      const currentUser = await getCurrentUser();
      
      if (!currentUser || currentUser.role !== 'ADMIN') {
        return NextResponse.json(
          { message: 'Admin hesabı oluşturmak için yetkiniz yok.' },
          { status: 403 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
      }
    });

    // Add user to default workspaces (1 and 2)
    if (role !== 'ADMIN') {
      const defaultWorkspaces = await prisma.workspace.findMany({
        take: 2,
        orderBy: { createdAt: 'asc' },
      });

      for (const workspace of defaultWorkspaces) {
        await prisma.workspaceUser.create({
          data: {
            userId: newUser.id,
            workspaceId: workspace.id,
          }
        });
      }
    }

    // Don't return the password
    const { password: _, ...userData } = newUser;

    return NextResponse.json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: userData
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Kullanıcı oluşturulurken bir hata meydana geldi.' },
      { status: 500 }
    );
  }
} 