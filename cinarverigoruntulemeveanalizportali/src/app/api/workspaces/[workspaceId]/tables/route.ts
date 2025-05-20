import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import prisma from '@/lib/db';

// GET: Get all tables for a workspace
export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    console.log(`GET /api/workspaces/${params.workspaceId}/tables called`);
    
    const safeParams = await params;
    const { workspaceId } = safeParams;
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        users: {
          where: {
            userId: currentUser.id
          }
        }
      }
    });

    if (!workspace) {
      return NextResponse.json(
        { message: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this workspace
    const isAdmin = currentUser.role === 'ADMIN';
    const isCreator = workspace.createdBy === currentUser.id;
    const hasAccess = workspace.users.length > 0;
    
    if (!isAdmin && !isCreator && !hasAccess) {
      return NextResponse.json(
        { message: 'You do not have access to this workspace' },
        { status: 403 }
      );
    }

    // Get all tables for this workspace
    const tables = await prisma.dataTable.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        workspaceId: true,
        sheetName: true,
        uploadedAt: true,
        data: true // Include data to calculate actual row count
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    // Transform the data to include rowCount without sending all the data
    const tablesWithRowCount = tables.map(table => {
      // Get actual row count by checking data array length
      const rowCount = Array.isArray(table.data) ? table.data.length : 0;
      
      // Return the table without including the full data array
      return {
        id: table.id,
        name: table.name,
        workspaceId: table.workspaceId,
        sheetName: table.sheetName,
        uploadedAt: table.uploadedAt,
        rowCount
      };
    });

    return NextResponse.json(tablesWithRowCount);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST: Create a new table
export async function POST(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const safeParams = await params;
    const { workspaceId } = safeParams;
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        users: {
          where: {
            userId: currentUser.id
          }
        }
      }
    });

    if (!workspace) {
      return NextResponse.json(
        { message: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this workspace
    const isAdmin = currentUser.role === 'ADMIN';
    const isCreator = workspace.createdBy === currentUser.id;
    const hasAccess = workspace.users.length > 0;
    
    if (!isAdmin && !isCreator && !hasAccess) {
      return NextResponse.json(
        { message: 'You do not have access to this workspace' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, sheetName, columns, data } = body;

    if (!name || !sheetName || !columns || !data) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the table
    const table = await prisma.dataTable.create({
      data: {
        name,
        sheetName,
        columns,
        data,
        workspaceId,
      }
    });

    return NextResponse.json(table);
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
} 