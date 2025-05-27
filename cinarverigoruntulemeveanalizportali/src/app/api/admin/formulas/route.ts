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

    const formulas = await prisma.formula.findMany({
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Manually fetch table information for formulas that have tableId
    const formulasWithTables = await Promise.all(
      formulas.map(async (formula) => {
        if (formula.tableId) {
          const table = await prisma.dataTable.findUnique({
            where: { id: formula.tableId },
            select: { id: true, name: true },
          });
          return { ...formula, table };
        }
        return { ...formula, table: null };
      })
    );

    return NextResponse.json(formulasWithTables);
  } catch (error) {
    console.error('Error fetching admin formulas:', error);
    return NextResponse.json(
      { message: 'Error fetching formulas' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, formula, color, type, active, workspaceId, tableId } = body;

    // Validate required fields
    if (!name || !formula || !workspaceId) {
      return NextResponse.json(
        { message: 'Name, formula, and workspace are required' },
        { status: 400 }
      );
    }

    // Verify workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (!workspace) {
      return NextResponse.json(
        { message: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Verify table exists if provided
    if (tableId) {
      const table = await prisma.dataTable.findUnique({
        where: { id: tableId }
      });

      if (!table) {
        return NextResponse.json(
          { message: 'Table not found' },
          { status: 404 }
        );
      }
    }

    const newFormula = await prisma.formula.create({
      data: {
        name,
        description: description || null,
        formula,
        color: color || '#ff0000',
        type: type || 'CELL_VALIDATION',
        active: active !== undefined ? active : true,
        workspaceId,
        tableId: tableId || null,
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Manually fetch table information if tableId exists
    let table = null;
    if (newFormula.tableId) {
      table = await prisma.dataTable.findUnique({
        where: { id: newFormula.tableId },
        select: { id: true, name: true },
      });
    }

    const formulaWithTable = { ...newFormula, table };

    return NextResponse.json(formulaWithTable, { status: 201 });
  } catch (error) {
    console.error('Error creating formula:', error);
    return NextResponse.json(
      { message: 'Error creating formula' },
      { status: 500 }
    );
  }
} 