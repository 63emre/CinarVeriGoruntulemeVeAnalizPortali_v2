import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';

interface RouteParams {
  params: {
    workspaceId: string;
    tableId: string;
  };
}

// GET /api/workspaces/[workspaceId]/tables/[tableId]/formulas
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { workspaceId, tableId } = params;
    const currentUser = await getCurrentUser();
    
    // Check authentication
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Bu eylemi gerçekleştirmek için oturum açmanız gerekiyor.' },
        { status: 401 }
      );
    }
    
    // Check if user has access to the workspace
    const userWorkspace = await prisma.workspaceUser.findFirst({
      where: {
        workspaceId,
        userId: currentUser.id,
      },
    });
    
    const isAdmin = currentUser.role === 'ADMIN';
    
    if (!userWorkspace && !isAdmin) {
      return NextResponse.json(
        { error: 'Bu çalışma alanına erişiminiz bulunmuyor.' },
        { status: 403 }
      );
    }
    
    // Fetch formulas for this table or workspace-wide formulas
    // Using Promise.all to run both queries concurrently for better performance
    const [tableFormulas, workspaceFormulas] = await Promise.all([
      // Fetch table-specific formulas
      prisma.formula.findMany({
        where: {
          tableId,
          workspaceId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      
      // Fetch workspace-wide formulas that are not table-specific
      prisma.formula.findMany({
        where: {
          workspaceId,
          tableId: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);
    
    // Combine both sets of formulas
    const allFormulas = [...tableFormulas, ...workspaceFormulas];
    
    return NextResponse.json(allFormulas);
  } catch (error) {
    console.error('Error fetching formulas:', error);
    return NextResponse.json(
      { error: 'Formüller yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 