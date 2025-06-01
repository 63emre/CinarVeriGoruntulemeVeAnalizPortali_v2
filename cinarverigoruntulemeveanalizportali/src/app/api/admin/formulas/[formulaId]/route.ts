import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';

export async function PUT(
  request: Request,
  context: { params: Promise<{ formulaId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { formulaId } = await context.params;
    const body = await request.json();
    const { name, description, formula, color, type, active, workspaceId, tableId } = body;

    // Validate required fields
    if (!name || !formula || !workspaceId) {
      return NextResponse.json(
        { message: 'Name, formula, and workspace are required' },
        { status: 400 }
      );
    }

    // Check if formula exists
    const existingFormula = await prisma.formula.findUnique({
      where: { id: formulaId }
    });

    if (!existingFormula) {
      return NextResponse.json(
        { message: 'Formula not found' },
        { status: 404 }
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

    const updatedFormula = await prisma.formula.update({
      where: { id: formulaId },
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
    if (updatedFormula.tableId) {
      table = await prisma.dataTable.findUnique({
        where: { id: updatedFormula.tableId },
        select: { id: true, name: true },
      });
    }

    const formulaWithTable = { ...updatedFormula, table };

    return NextResponse.json(formulaWithTable);
  } catch (error) {
    console.error('Error updating formula:', error);
    return NextResponse.json(
      { message: 'Error updating formula' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ formulaId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { formulaId } = await context.params;

    // Check if formula exists
    const existingFormula = await prisma.formula.findUnique({
      where: { id: formulaId }
    });

    if (!existingFormula) {
      return NextResponse.json(
        { message: 'Formula not found' },
        { status: 404 }
      );
    }

    await prisma.formula.delete({
      where: { id: formulaId }
    });

    return NextResponse.json(
      { message: 'Formula deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting formula:', error);
    return NextResponse.json(
      { message: 'Error deleting formula' },
      { status: 500 }
    );
  }
} 