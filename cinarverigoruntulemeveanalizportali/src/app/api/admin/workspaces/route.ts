import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const workspaces = await prisma.workspace.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error('Error fetching admin workspaces:', error);
    return NextResponse.json(
      { message: 'Error fetching workspaces' },
      { status: 500 }
    );
  }
} 