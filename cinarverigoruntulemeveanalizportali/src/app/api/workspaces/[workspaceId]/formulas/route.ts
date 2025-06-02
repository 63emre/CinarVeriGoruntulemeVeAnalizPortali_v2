import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import * as z from 'zod';
import prisma from '@/lib/db';
import { deleteFormula } from '@/lib/formula/formula-service';
import { validateUnidirectionalFormula } from '@/lib/enhancedFormulaEvaluator';

// Schema for formula creation
const FormulaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  formula: z.string().min(1, "Formula is required"),
  tableId: z.string().optional().nullable(),
  color: z.string().optional(),
  type: z.enum(['CELL_VALIDATION', 'RELATIONAL']),
  active: z.boolean().optional(),
  scope: z.enum(['table', 'workspace']).optional(),
});

export interface FormulaCondition {
  operand1: string;
  arithmeticOperator?: '+' | '-' | '*' | '/';
  operand2?: string;
  comparisonOperator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  operand3: string;
  isConstant?: boolean;
}

// GET: Get all formulas for a workspace
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    // Next.js 15: await params
    const { workspaceId } = await params;

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

    // Get all formulas for this workspace
    const formulas = await prisma.formula.findMany({
      where: { workspaceId },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(formulas, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching formulas:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST: Create a new formula
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check workspace access
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (!workspace) {
      return NextResponse.json(
        { message: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Check access permissions - simplified version
    const isAdmin = currentUser.role === 'ADMIN';
    const isCreator = workspace.createdBy === currentUser.id;
    
    if (!isAdmin && !isCreator) {
      const userWorkspace = await prisma.workspaceUser.findFirst({
        where: {
          userId: currentUser.id,
          workspaceId,
        },
      });
      
      if (!userWorkspace) {
        return NextResponse.json(
          { message: 'You do not have access to this workspace' },
          { status: 403 }
        );
      }
    }

    // ENHANCED: Parse request body with scope support
    const body = await request.json();
    const { 
      name, 
      description, 
      formula, 
      color, 
      type = 'CELL_VALIDATION',
      scope = 'workspace', // ENHANCED: Default to workspace scope for backward compatibility
      tableId // ENHANCED: Optional table ID for table-scoped formulas
    } = body;

    // Validate required fields
    if (!name || !formula) {
      return NextResponse.json(
        { message: 'Name and formula are required' },
        { status: 400 }
      );
    }

    // ENHANCED: Validate scope-specific requirements
    if (scope === 'table' && !tableId) {
      return NextResponse.json(
        { message: 'Table ID is required for table-scoped formulas' },
        { status: 400 }
      );
    }

    // ENHANCED: If table scope, verify table exists and belongs to workspace
    if (scope === 'table' && tableId) {
      const targetTable = await prisma.dataTable.findUnique({
        where: {
          id: tableId,
          workspaceId: workspaceId
        }
      });

      if (!targetTable) {
        return NextResponse.json(
          { message: 'Target table not found or does not belong to this workspace' },
          { status: 404 }
        );
      }
    }

    // ENHANCED: Validate formula syntax using enhanced evaluator
    const testVariables = ['TestVar1', 'TestVar2', 'TestVar3'];
    const validationResult = validateUnidirectionalFormula(formula, testVariables);
    
    if (!validationResult.isValid) {
      return NextResponse.json(
        { 
          message: 'Invalid formula', 
          error: validationResult.error,
          details: {
            leftVariables: validationResult.leftVariables,
            rightVariables: validationResult.rightVariables,
            missingVariables: validationResult.missingVariables
          }
        },
        { status: 400 }
      );
    }

    // Create the formula with enhanced scope support
    const newFormula = await prisma.formula.create({
      data: {
        name,
        description,
        formula,
        color: color || '#ff4444',
        type: type as 'CELL_VALIDATION' | 'RELATIONAL',
        workspaceId,
        tableId: scope === 'table' ? tableId : null, // ENHANCED: Set tableId only for table scope
        active: true
      }
    });

    console.log(`✅ Created ${scope}-scoped formula: "${name}" ${tableId ? `for table ${tableId}` : 'for entire workspace'}`);

    return NextResponse.json({
      formula: newFormula,
      validation: {
        isValid: true,
        targetVariable: validationResult.targetVariable,
        scope: scope,
        appliedTo: scope === 'table' ? `Table: ${tableId}` : 'All tables in workspace'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating formula:', error);
    return NextResponse.json(
      { message: 'Failed to create formula', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE: Delete a formula
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    // Next.js 15: await params
    const { workspaceId } = await params;
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const formulaId = url.searchParams.get('formulaId');

    if (!formulaId) {
      return NextResponse.json(
        { message: 'Formula ID is required' },
        { status: 400 }
      );
    }

    // Check if user has access to this workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        formulas: {
          some: {
            id: formulaId,
          },
        },
        OR: [
          { createdBy: currentUser.id },
          {
            users: {
              some: {
                userId: currentUser.id,
              },
            },
          },
        ],
      },
    });

    if (!workspace && currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Workspace or formula not found or you do not have access' },
        { status: 403 }
      );
    }

    // Delete the formula
    await deleteFormula(formulaId);

    return NextResponse.json({
      message: 'Formula deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting formula:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
} 