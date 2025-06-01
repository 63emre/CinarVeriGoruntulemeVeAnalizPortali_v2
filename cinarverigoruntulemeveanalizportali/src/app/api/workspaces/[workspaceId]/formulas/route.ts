import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import * as z from 'zod';
import prisma from '@/lib/db';
import { deleteFormula } from '@/lib/formula/formula-service';

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

    // Parse and validate request body
    const body = await request.json();
    const validation = FormulaSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid formula data', errors: validation.error.errors },
        { status: 400 }
      );
    }

    // Create the formula
    const { name, description, formula, tableId, color, type, active, scope } = validation.data;
    
    // ENHANCED: Validate scope and tableId relationship
    if (scope === 'table' && !tableId) {
      return NextResponse.json(
        { message: 'Table ID is required when scope is set to table' },
        { status: 400 }
      );
    }
    
    if (scope === 'workspace' && tableId) {
      return NextResponse.json(
        { message: 'Table ID should not be provided when scope is set to workspace' },
        { status: 400 }
      );
    }
    
    // Check if tableId exists if provided
    if (tableId) {
      const table = await prisma.dataTable.findUnique({
        where: { 
          id: tableId,
          workspaceId 
        }
      });
      
      if (!table) {
        return NextResponse.json(
          { message: 'Table not found' },
          { status: 404 }
        );
      }
    }
    
    // ENHANCED: Set default scope based on tableId if scope not provided
    const finalScope = scope || (tableId ? 'table' : 'workspace');
    const finalTableId = finalScope === 'table' ? tableId : null;
    
    // Create formula
    const newFormula = await prisma.formula.create({
      data: {
        name,
        description: description || null,
        formula,
        tableId: finalTableId,
        color: color || '#ef4444',
        type,
        active: active !== undefined ? active : true,
        workspaceId,
        // ENHANCED: Store scope information (if your database schema supports it)
        // scope: finalScope, // Uncomment if you add scope column to database
      }
    });

    return NextResponse.json(newFormula);
  } catch (error) {
    console.error('Error creating formula:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
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