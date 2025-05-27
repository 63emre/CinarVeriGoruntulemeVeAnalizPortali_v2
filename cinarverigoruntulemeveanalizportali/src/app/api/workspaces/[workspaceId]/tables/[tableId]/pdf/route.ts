import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import prisma from '@/lib/db';
import { exportTableToPdf } from '@/lib/pdf/pdf-service';

// POST /api/workspaces/[workspaceId]/tables/[tableId]/pdf
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string; tableId: string }> }
) {
  try {
    // Access the currently logged in user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the parameters
    const { workspaceId, tableId } = await context.params;

    // First check if the table exists and if user has access to it
    const table = await prisma.dataTable.findUnique({
      where: {
        id: tableId,
        workspaceId: workspaceId,
      },
      include: {
        workspace: true,
      },
    });

    if (!table) {
      return NextResponse.json(
        { message: 'Table not found' },
        { status: 404 }
      );
    }

    // If not admin, check if user has access to the workspace
    if (currentUser.role !== 'ADMIN') {
      const hasAccess = await prisma.workspaceUser.findFirst({
        where: {
          userId: currentUser.id,
          workspaceId,
        },
      });

      if (!hasAccess) {
        return NextResponse.json(
          { message: 'You do not have access to this workspace' },
          { status: 403 }
        );
      }
    }
      // Get request body for optional parameters
    let requestData;
    try {
      requestData = await request.json();
    } catch (error) {
      console.error('Error parsing JSON body:', error);
      requestData = {}; // Default empty object if JSON parsing fails
    }
    
    const { title, subtitle, includeDate, highlightedCells = [] } = requestData;
    
    // Ensure highlightedCells is an array
    const validHighlightedCells = Array.isArray(highlightedCells) ? highlightedCells : [];
    
    // Log for debugging
    console.log('Received highlighted cells for PDF:', validHighlightedCells.length);
    if (validHighlightedCells.length > 0) {
      console.log('First highlighted cell example:', validHighlightedCells[0]);
    }// Convert Prisma table data to the format expected by PDF generator
    const formattedTable = {
      id: table.id,
      name: table.name,
      sheetName: table.sheetName,
      workspaceId: table.workspaceId,
      uploadedAt: table.uploadedAt,
      updatedAt: table.updatedAt,
      columns: Array.isArray(table.columns) ? table.columns : (typeof table.columns === 'object' && table.columns !== null ? Object.values(table.columns as object) : []),
      data: Array.isArray(table.data) ? table.data : (typeof table.data === 'object' && table.data !== null ? Object.values(table.data as object) : []),
      workspace: table.workspace
    };
    
    // Log data format for debugging
    console.log(`Table columns type: ${typeof table.columns}, isArray: ${Array.isArray(table.columns)}`);
    console.log(`Table data type: ${typeof table.data}, isArray: ${Array.isArray(table.data)}`);
      // Generate PDF from table data
    const pdfBuffer = await exportTableToPdf(
      formattedTable, 
      validHighlightedCells,
      [], // formulas array (optional)
      {
        title: title || table.name,
        subtitle: subtitle || table.workspace.name,
        includeDate: includeDate !== undefined ? includeDate : true,
        userName: currentUser.name || currentUser.email,
      }
    );

    // Create a new NextResponse with the PDF
    const response = new NextResponse(pdfBuffer);
    
    // Set the appropriate headers
    response.headers.set('Content-Type', 'application/pdf');
    response.headers.set('Content-Disposition', `attachment; filename="${table.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.pdf"`);
    
    return response;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { message: 'Error generating PDF' },
      { status: 500 }
    );
  }
}