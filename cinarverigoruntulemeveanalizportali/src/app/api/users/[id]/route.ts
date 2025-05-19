import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser, hashPassword } from '@/lib/auth/auth';
import { Prisma } from '@/generated/prisma';

// GET: Get a specific user
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Check if user is admin or requesting their own profile
    if (user.role !== 'ADMIN' && user.id !== id) {
      return NextResponse.json(
        { message: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
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
                description: true,
              },
            },
          },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(targetUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// PUT: Update a user
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    
    // Check if current user is admin or updating their own profile
    if (currentUser.role !== 'ADMIN' && currentUser.id !== id) {
      return NextResponse.json(
        { message: 'Bu işlem için yetkiniz bulunmamaktadır' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password } = body;
    let { role, workspaceIds } = body;

    // Regular users cannot change their role or workspaces
    if (currentUser.role !== 'ADMIN') {
      role = undefined;
      workspaceIds = undefined;
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id },
    });

    if (!userExists) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Check if new email is already used by another user
    if (email && email !== userExists.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email,
          id: { not: id },
        },
      });

      if (emailExists) {
        return NextResponse.json(
          { message: 'Bu e-posta adresi zaten kullanılıyor' },
          { status: 409 }
        );
      }
    }

    // Update user data
    const updateData: Prisma.UserUpdateInput = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await hashPassword(password);
    if (role) updateData.role = role;

    // Update the user in a transaction if workspaces need to be updated
    if (workspaceIds && Array.isArray(workspaceIds)) {
      const updatedUser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Update user details
        const user = await tx.user.update({
          where: { id },
          data: updateData,
        });

        // Update workspace assignments if needed
        await tx.workspaceUser.deleteMany({
          where: { userId: id },
        });

        if (workspaceIds.length > 0) {
          await tx.workspaceUser.createMany({
            data: workspaceIds.map((workspaceId: string) => ({
              userId: id,
              workspaceId,
            })),
            skipDuplicates: true,
          });
        }

        return user;
      });

      return NextResponse.json({
        message: 'Kullanıcı başarıyla güncellendi',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      });
    } else {
      // Update user without changing workspaces
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({
        message: 'Kullanıcı başarıyla güncellendi',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a user
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }

    // Only admins can delete users
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Bu işlem için admin yetkisi gereklidir' },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    // Prevent deleting the admin user
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Don't allow deleting the default admin or yourself
    if (targetUser.email === 'admin@cinar.com' || id === user.id) {
      return NextResponse.json(
        { message: 'Bu kullanıcı silinemez' },
        { status: 403 }
      );
    }

    // Delete the user (cascade delete will handle user-workspace relations)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Kullanıcı başarıyla silindi',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 