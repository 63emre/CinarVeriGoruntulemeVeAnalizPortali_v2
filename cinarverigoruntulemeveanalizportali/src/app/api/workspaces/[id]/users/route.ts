import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';

// Get users for a specific workspace
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`GET /api/workspaces/${params.id}/users called`);
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }
    
    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id }
    });
    
    if (!workspace) {
      return NextResponse.json(
        { message: 'Çalışma alanı bulunamadı' },
        { status: 404 }
      );
    }
    
    // Only admin or users with access can view workspace users
    const hasAccess = await prisma.workspaceUser.findFirst({
      where: {
        userId: currentUser.id,
        workspaceId: params.id,
      },
    });
    
    if (currentUser.role !== 'ADMIN' && !hasAccess) {
      return NextResponse.json(
        { message: 'Bu çalışma alanına erişim izniniz yok' },
        { status: 403 }
      );
    }

    // Get all users for this workspace
    const workspaceUsers = await prisma.workspaceUser.findMany({
      where: {
        workspaceId: params.id,
      },
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
    });

    // Extract user information
    const users = workspaceUsers.map((wu) => wu.user);
    
    return NextResponse.json(users);

  } catch (error) {
    console.error('Error getting workspace users:', error);
    return NextResponse.json(
      { message: 'Kullanıcılar yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Add users to a workspace (admin only)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`POST /api/workspaces/${params.id}/users called`);
    
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { userIds } = body;
    
    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { message: 'Geçersiz istek formatı' },
        { status: 400 }
      );
    }

    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id }
    });
    
    if (!workspace) {
      return NextResponse.json(
        { message: 'Çalışma alanı bulunamadı' },
        { status: 404 }
      );
    }

    // Add users to workspace
    const operations = userIds.map(userId => 
      prisma.workspaceUser.upsert({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId: params.id,
          }
        },
        update: {},
        create: {
          userId,
          workspaceId: params.id,
        },
      })
    );
    
    await prisma.$transaction(operations);
    
    return NextResponse.json({ message: 'Kullanıcılar başarıyla eklendi' });

  } catch (error) {
    console.error('Error adding users to workspace:', error);
    return NextResponse.json(
      { message: 'Kullanıcılar eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Remove a user from a workspace (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`DELETE /api/workspaces/${params.id}/users called`);
    
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { message: 'Kullanıcı ID parametresi gereklidir' },
        { status: 400 }
      );
    }

    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id }
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
          workspaceId: params.id,
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