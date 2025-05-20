import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';

// GET: Get a specific table
export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string; tableId: string } }
) {
  try {
    // Don't use string interpolation with params directly - await it
    const safeParams = await params;
    console.log(`GET /api/workspaces/${safeParams.workspaceId}/tables/${safeParams.tableId} called`);

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { workspaceId, tableId } = safeParams;

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

    // Get the table
    const table = await prisma.dataTable.findUnique({
      where: { 
        id: tableId,
        workspaceId: workspaceId
      }
    });

    if (!table) {
      return NextResponse.json(
        { message: 'Table not found' },
        { status: 404 }
      );
    }

    // Format dates in the JSON data if needed
    let formattedData = table.data as any[];
    if (Array.isArray(formattedData)) {
      // Don't modify actual data, but provide proper metadata for date columns
      const dateColumnIndexes: number[] = [];
      
      // Find date columns by trying to parse values - check first 5 rows to make a best guess
      if (formattedData.length > 0) {
        const sampleSize = Math.min(5, formattedData.length);
        
        for (let colIndex = 0; colIndex < (table.columns as string[]).length; colIndex++) {
          let dateCount = 0;
          
          for (let rowIndex = 0; rowIndex < sampleSize; rowIndex++) {
            if (!formattedData[rowIndex]) continue;
            
            const value = formattedData[rowIndex][colIndex];
            if (typeof value === 'string') {
              // Try to detect date formats (ISO dates, DD.MM.YYYY, etc.)
              const isDate = /^\d{4}-\d{2}-\d{2}|^\d{2}[./-]\d{2}[./-]\d{4}/.test(value);
              if (isDate) {
                dateCount++;
              }
            }
          }
          
          // If most sample values look like dates, mark as date column
          if (dateCount > sampleSize / 2) {
            dateColumnIndexes.push(colIndex);
          }
        }
      }
      
      // Add metadata for front-end to know which columns are dates
      const tableWithMeta = {
        ...table,
        dateColumns: dateColumnIndexes,
        rowCount: Array.isArray(formattedData) ? formattedData.length : 0
      };
      
      return NextResponse.json(tableWithMeta);
    }

    return NextResponse.json(table);
  } catch (error) {
    console.error('Error fetching table:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT: Update a table
export async function PUT(
  request: NextRequest,
  { params }: { params: { workspaceId: string; tableId: string } }
) {
  try {
    const safeParams = await params;
    const { workspaceId, tableId } = safeParams;
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if workspace exists and user has access
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

    // Check permissions
    const isAdmin = currentUser.role === 'ADMIN';
    const isCreator = workspace.createdBy === currentUser.id;
    const hasAccess = workspace.users.length > 0;
    
    if (!isAdmin && !isCreator && !hasAccess) {
      return NextResponse.json(
        { message: 'You do not have permission to update this table' },
        { status: 403 }
      );
    }

    // Get the existing table
    const existingTable = await prisma.dataTable.findUnique({
      where: { 
        id: tableId,
        workspaceId: workspaceId
      }
    });

    if (!existingTable) {
      return NextResponse.json(
        { message: 'Table not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const data = await request.json();
    
    // Update the table
    const updatedTable = await prisma.dataTable.update({
      where: { id: tableId },
      data: {
        name: data.name || existingTable.name,
        columns: data.columns || existingTable.columns,
        data: data.data || existingTable.data,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Table updated successfully',
      table: updatedTable
    });
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE: Delete a table
export async function DELETE(
  request: NextRequest,
  { params }: { params: { workspaceId: string; tableId: string } }
) {
  try {
    const safeParams = await params;
    const { workspaceId, tableId } = safeParams;
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions
    if (currentUser.role !== 'ADMIN') {
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { createdBy: true }
      });
      
      if (!workspace || workspace.createdBy !== currentUser.id) {
        return NextResponse.json(
          { message: 'Only admins and workspace creators can delete tables' },
          { status: 403 }
        );
      }
    }

    // Delete the table
    await prisma.dataTable.delete({
      where: { 
        id: tableId,
        workspaceId: workspaceId
      }
    });

    return NextResponse.json({
      message: 'Table deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
} 