import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/auth';

// GET: Get all workspaces for the current user
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    let workspaces;
    
    if (currentUser.role === 'ADMIN') {
      // Admins can see all workspaces
      workspaces = await prisma.workspace.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          _count: {
            select: {
              tables: true,
              formulas: true
            }
          }
        }
      });
    } else {
      // Regular users can only see workspaces they created or are part of
      workspaces = await prisma.workspace.findMany({
        where: {
          OR: [
            { createdBy: currentUser.id },
            {
              users: {
                some: {
                  userId: currentUser.id
                }
              }
            }
          ]
        },
        orderBy: { createdAt: 'desc' },
        include: {
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          _count: {
            select: {
              tables: true,
              formulas: true
            }
          }
        }
      });
    }
    
    return NextResponse.json(workspaces, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST: Create a new workspace
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { name, description } = body;
    
    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Create workspace
    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        createdBy: currentUser.id,
        users: {
          create: {
            userId: currentUser.id,
          }
        }
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            tables: true,
            formulas: true
          }
        }
      }
    });
    
    return NextResponse.json(workspace);
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
} 