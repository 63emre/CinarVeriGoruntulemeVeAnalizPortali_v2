import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import * as z from 'zod';
import prisma from '@/lib/db';
import { saveFormula, getFormulas, deleteFormula } from '@/lib/formula/formula-service';

// Schema for formula creation/update
const FormulaSchema = z.object({
  name: z.string().min(1, 'Formül adı zorunludur'),
  description: z.string().optional(),
  formula: z.string().min(1, 'Formül ifadesi zorunludur'),
  tableId: z.string().optional(),
  color: z.string().optional(),
  type: z.enum(['cell-validation', 'relational']),
});

// GET: Get all formulas for a workspace
export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params;
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (!workspace) {
      return NextResponse.json(
        { message: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this workspace
    const hasAccess = await prisma.workspaceUser.findFirst({
      where: {
        userId: currentUser.id,
        workspaceId,
      },
    });

    const isCreator = workspace.createdBy === currentUser.id;

    if (!hasAccess && !isCreator && currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'You do not have access to this workspace' },
        { status: 403 }
      );
    }

    // Get all formulas for this workspace
    const formulas = await getFormulas(workspaceId);

    return NextResponse.json(formulas);
  } catch (error) {
    console.error('Error getting formulas:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST: Create a new formula
export async function POST(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = params;
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (!workspace) {
      return NextResponse.json(
        { message: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this workspace
    const hasAccess = await prisma.workspaceUser.findFirst({
      where: {
        userId: currentUser.id,
        workspaceId,
      },
    });

    const isCreator = workspace.createdBy === currentUser.id;

    if (!hasAccess && !isCreator && currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'You do not have access to this workspace' },
        { status: 403 }
      );
    }

    // Parse request body
    const data = await request.json();
    
    if (!data.name || !data.expression || !data.color) {
      return NextResponse.json(
        { message: 'Missing required fields: name, expression, color' },
        { status: 400 }
      );
    }

    // Create new formula
    const formula = await saveFormula(
      data.name,
      data.description || '',
      data.expression,
      workspaceId,
      data.color,
      data.tableId
    );

    return NextResponse.json(formula);
  } catch (error) {
    console.error('Error creating formula:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a formula
export async function DELETE(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }

    const { workspaceId } = params;
    const url = new URL(request.url);
    const formulaId = url.searchParams.get('formulaId');

    if (!formulaId) {
      return NextResponse.json(
        { message: 'Formül ID gereklidir' },
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
          { createdBy: user.id },
          {
            users: {
              some: {
                userId: user.id,
              },
            },
          },
        ],
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { message: 'Çalışma alanı veya formül bulunamadı ya da erişim izniniz yok' },
        { status: 403 }
      );
    }

    // Delete the formula
    await deleteFormula(formulaId);

    return NextResponse.json({
      message: 'Formül başarıyla silindi',
    });
  } catch (error) {
    console.error('Error deleting formula:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 