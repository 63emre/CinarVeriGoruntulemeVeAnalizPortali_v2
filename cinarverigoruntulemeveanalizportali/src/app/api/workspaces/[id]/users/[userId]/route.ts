import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';

// Delete a user from a workspace (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string, userId: string } }
) {
  try {
    console.log(`DELETE /api/workspaces/${params.id}/users/${params.userId} called`);
    
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }
    
    const { id: workspaceId, userId } = params;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Kullanıcı ID parametresi gereklidir' },
        { status: 400 }
      );
    }

    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });
    
    if (!workspace) {
      return NextResponse.json(
        { message: 'Çalışma alanı bulunamadı' },
        { status: 404 }
      );
    }

    // Remove user from workspace
    await prisma.workspaceUser.delete({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        }
      }
    });
    
    return NextResponse.json({ message: 'Kullanıcı başarıyla çıkarıldı' });

  } catch (error) {
    console.error('Error removing user from workspace:', error);
    return NextResponse.json(
      { message: 'Kullanıcı çıkarılırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 