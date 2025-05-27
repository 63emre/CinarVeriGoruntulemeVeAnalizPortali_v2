import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword } from '@/lib/auth/auth';

export async function POST() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@cinar.com' }
    });

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin user already exists',
        user: {
          id: existingAdmin.id,
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role
        }
      });
    }

    // Create admin user
    const hashedPassword = await hashPassword('admin123');
    
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@cinar.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    // Create a default workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: 'Test Çalışma Alanı',
        description: 'Test amaçlı varsayılan çalışma alanı',
        createdBy: adminUser.id
      }
    });

    return NextResponse.json({
      message: 'Admin user and workspace created successfully',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      },
      workspace: {
        id: workspace.id,
        name: workspace.name
      },
      credentials: {
        email: 'admin@cinar.com',
        password: 'admin123'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { 
        error: 'Seed failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 