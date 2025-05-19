import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';

// GET: Get all workspaces
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }

    // If user is admin, get all workspaces
    // If user is not admin, get only workspaces assigned to them
    const workspaces = user.role === 'ADMIN' 
      ? await prisma.workspace.findMany({
          include: {
            _count: {
              select: { tables: true, formulas: true }
            }
          }
        })
      : await prisma.workspace.findMany({
          where: {
            users: {
              some: {
                userId: user.id
              }
            }
          },
          include: {
            _count: {
              select: { tables: true, formulas: true }
            }
          }
        });

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// POST: Create a new workspace
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }

    // Only admins can create workspaces
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Bu işlem için admin yetkisi gereklidir' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, userIds = [] } = body;

    if (!name) {
      return NextResponse.json(
        { message: 'Çalışma alanı adı gereklidir' },
        { status: 400 }
      );
    }

    // Create the workspace in a transaction to ensure all related data is created
    const workspace = await prisma.$transaction(async (tx) => {
      // First create the workspace
      const newWorkspace = await tx.workspace.create({
        data: {
          name,
          description,
          createdBy: user.id,
        },
      });

      // Then create the workspace-user relationships
      const userConnections = userIds.map((userId: string) => ({
        userId,
        workspaceId: newWorkspace.id,
      }));

      // Always add the creator (admin) to the workspace
      userConnections.push({
        userId: user.id,
        workspaceId: newWorkspace.id,
      });

      // Create unique user connections (to avoid duplicates)
      const uniqueUserConnections = userConnections.filter(
        (connection, index, self) =>
          index === self.findIndex(c => c.userId === connection.userId)
      );

      // Create workspace-user relationships
      await tx.workspaceUser.createMany({
        data: uniqueUserConnections,
        skipDuplicates: true,
      });

      return newWorkspace;
    });

    return NextResponse.json({
      message: 'Çalışma alanı başarıyla oluşturuldu',
      workspace,
    });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 