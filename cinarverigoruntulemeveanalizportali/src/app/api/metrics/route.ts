import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    // Check authentication 
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    // Get counts from the database
    const [
      userCount,
      workspaceCount,
      tableCount,
      formulaCount,
      activeFormulaCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.workspace.count(),
      prisma.dataTable.count(),
      prisma.formula.count(),
      prisma.formula.count({
        where: {
          active: true
        }
      })
    ]);
    
    // Get analyzed rows count by analyzing the data field in each table
    let analyzedRows = 0;
    try {
      // Fetch all tables with their data
      const dataTables = await prisma.dataTable.findMany({
        select: {
          data: true
        }
      });
      
      // Count rows in each table's data field (which is likely an array of rows)
      analyzedRows = dataTables.reduce((sum, table) => {
        // Assuming data is stored as an array of rows
        const tableData = table.data;
        const rowCount = Array.isArray(tableData) ? tableData.length : 0;
        return sum + rowCount;
      }, 0);
    } catch (error) {
      console.error('Could not calculate analyzed rows:', error);
      // Fallback to zero if we can't calculate
    }
    
    // Return the metrics
    return NextResponse.json({
      users: userCount,
      workspaces: workspaceCount,
      tables: tableCount,
      formulas: formulaCount,
      activeFormulas: activeFormulaCount,
      analyzedRows
    });
    
  } catch (error) {
    console.error('Metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
} 