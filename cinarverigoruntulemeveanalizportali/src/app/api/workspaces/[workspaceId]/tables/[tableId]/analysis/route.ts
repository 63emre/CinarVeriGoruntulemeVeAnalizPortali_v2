import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import prisma from '@/lib/db';

// GET /api/workspaces/[workspaceId]/tables/[tableId]/analysis
export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string; tableId: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const { workspaceId, tableId } = params;
    
    // Check if user has access to this workspace
    const workspaceUser = await prisma.workspaceUser.findFirst({
      where: {
        workspaceId,
        userId: user.id,
      },
    });
    
    if (!workspaceUser) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    // Get the table data
    const table = await prisma.dataTable.findUnique({
      where: {
        id: tableId,
        workspaceId,
      },
    });
    
    if (!table) {
      return NextResponse.json({ message: 'Table not found' }, { status: 404 });
    }
    
    // Structure the data for analysis
    const columns = table.columns as string[];
    const data = table.data as (string | number | null)[][];
    
    // Extract variables (from the "Variable" column)
    const variableColumnIndex = columns.findIndex(
      (col) => col.toLowerCase() === 'variable'
    );
    
    let variables: string[] = [];
    
    if (variableColumnIndex !== -1) {
      variables = Array.from(
        new Set(
          data
            .map((row) => row[variableColumnIndex])
            .filter((val) => val !== null && val !== '')
        )
      ) as string[];
    }
    
    // Extract date columns (all columns except standard ones)
    const standardColumns = ['Data Source', 'Variable', 'Method', 'Unit', 'LOQ'];
    const dateColumns = columns.filter((col) => !standardColumns.includes(col));
    
    return NextResponse.json({
      id: table.id,
      name: table.name,
      sheetName: table.sheetName,
      columns,
      data,
      variables,
      dateColumns,
    });
  } catch (error) {
    console.error('Error fetching analysis data:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
