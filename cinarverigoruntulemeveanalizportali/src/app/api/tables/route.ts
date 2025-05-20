import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }

    // Get all tables that the user has access to
    const tables = await prisma.dataTable.findMany({
      where: {
        workspace: {
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
      },
      select: {
        id: true,
        name: true,
        sheetName: true,
        uploadedAt: true,
        workspaceId: true,
        data: true,
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calculate row count for each table
    const tablesWithRowCount = tables.map(table => ({
      id: table.id,
      name: `${table.name} - ${table.sheetName}`,
      workspace: table.workspace,
      rowCount: Array.isArray(table.data) ? table.data.length : 0,
      createdAt: table.uploadedAt,
    }));

    return NextResponse.json(tablesWithRowCount);
  } catch (error) {
    console.error('Error getting tables:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 