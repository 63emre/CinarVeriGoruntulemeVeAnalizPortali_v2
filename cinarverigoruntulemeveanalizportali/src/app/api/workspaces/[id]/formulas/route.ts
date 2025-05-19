import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';
import { saveFormula, getFormulas, deleteFormula } from '@/lib/formula/formula-service';

// GET: Get all formulas for a workspace
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }

    const { id: workspaceId } = params;

    // Check if user has access to this workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
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
        { message: 'Çalışma alanı bulunamadı veya erişim izniniz yok' },
        { status: 403 }
      );
    }

    // Get all formulas for this workspace
    const formulas = await getFormulas(workspaceId);

    return NextResponse.json(formulas);
  } catch (error) {
    console.error('Error fetching formulas:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// POST: Create a new formula
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }

    const { id: workspaceId } = params;

    // Check if user has access to this workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
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
        { message: 'Çalışma alanı bulunamadı veya erişim izniniz yok' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, formula, color, tableId } = body;

    if (!name || !formula) {
      return NextResponse.json(
        { message: 'Formül adı ve formül içeriği gereklidir' },
        { status: 400 }
      );
    }

    // Create the formula
    const newFormula = await saveFormula(
      name,
      description || '',
      formula,
      workspaceId,
      color || '#ff0000',
      tableId
    );

    return NextResponse.json({
      message: 'Formül başarıyla oluşturuldu',
      formula: newFormula,
    });
  } catch (error) {
    console.error('Error creating formula:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a formula
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }

    const { id: workspaceId } = params;
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