import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';

export async function DELETE(_: Request, context: { params: Promise<{ tableId: string }> }) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Yetkilendirme hatası' },
        { status: 401 }
      );
    }

    const { tableId } = await context.params;

    // Check if table exists and user has access to it
    const table = await prisma.dataTable.findFirst({
      where: {
        id: tableId,
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
    });

    if (!table) {
      return NextResponse.json(
        { message: 'Tablo bulunamadı veya silme yetkiniz yok' },
        { status: 404 }
      );
    }

    // Delete the table
    await prisma.dataTable.delete({
      where: { id: tableId },
    });

    return NextResponse.json({ message: 'Tablo başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 