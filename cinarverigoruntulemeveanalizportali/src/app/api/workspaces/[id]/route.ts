import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';
import { Prisma } from '@/generated/prisma';

// GET: Get a specific workspace
export async function GET(
  request: Request,
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

    // Find the workspace with tables, formulas, and users
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        tables: true,
        formulas: true,
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { message: 'Çalışma alanı bulunamadı' },
        { status: 404 }
      );
    }

    // Check if user has access to this workspace
    if (
      user.role !== 'ADMIN' &&
      !workspace.users.some((wu: { userId: string }) => wu.userId === user.id)
    ) {
      return NextResponse.json(
        { message: 'Bu çalışma alanına erişim izniniz yok' },
        { status: 403 }
      );
    }

    return NextResponse.json(workspace);
  } catch (error) {
    console.error('Error fetching workspace:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// PUT: Update a workspace
export async function PUT(
  request: Request,
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

    // Only admins can update workspaces
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Bu işlem için admin yetkisi gereklidir' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const { name, description, userIds } = body;

    // Check if workspace exists
    const existingWorkspace = await prisma.workspace.findUnique({
      where: { id },
    });

    if (!existingWorkspace) {
      return NextResponse.json(
        { message: 'Çalışma alanı bulunamadı' },
        { status: 404 }
      );
    }

    // Update the workspace in a transaction if users need to be updated
    const updatedWorkspace = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update workspace details
      const workspace = await tx.workspace.update({
        where: { id },
        data: {
          name: name || existingWorkspace.name,
          description: description !== undefined ? description : existingWorkspace.description,
        },
      });

      // Update user assignments if needed
      if (userIds && Array.isArray(userIds)) {
        await tx.workspaceUser.deleteMany({
          where: { workspaceId: id },
        });

        if (userIds.length > 0) {
          await tx.workspaceUser.createMany({
            data: userIds.map((userId: string) => ({
              userId,
              workspaceId: id,
            })),
            skipDuplicates: true,
          });
        }
      }

      return workspace;
    });

    return NextResponse.json({
      message: 'Çalışma alanı başarıyla güncellendi',
      workspace: updatedWorkspace,
    });
  } catch (error) {
    console.error('Error updating workspace:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a workspace
export async function DELETE(
  request: Request,
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

    // Only admins can delete workspaces
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Bu işlem için admin yetkisi gereklidir' },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    // Check if workspace exists
    const existingWorkspace = await prisma.workspace.findUnique({
      where: { id },
    });

    if (!existingWorkspace) {
      return NextResponse.json(
        { message: 'Çalışma alanı bulunamadı' },
        { status: 404 }
      );
    }

    // Delete the workspace (cascade delete will handle related records)
    await prisma.workspace.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Çalışma alanı başarıyla silindi',
    });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 