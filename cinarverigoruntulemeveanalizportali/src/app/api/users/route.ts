import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser, hashPassword } from '@/lib/auth/auth';
import { Prisma } from '@/generated/prisma';

// GET: Get all users
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }

    // Only admins can list all users
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Bu işlem için admin yetkisi gereklidir' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        workspaces: {
          include: {
            workspace: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// POST: Create a new user
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }

    // Only admins can create users
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Bu işlem için admin yetkisi gereklidir' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, role = 'USER', workspaceIds = [] } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Ad, email ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user and assign to workspaces in a transaction
    const newUser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create the user
      const createdUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role as 'USER' | 'ADMIN',
        },
      });

      // Assign workspaces if any
      if (workspaceIds.length > 0) {
        await tx.workspaceUser.createMany({
          data: workspaceIds.map((workspaceId: string) => ({
            userId: createdUser.id,
            workspaceId,
          })),
          skipDuplicates: true,
        });
      }

      return createdUser;
    });

    return NextResponse.json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 