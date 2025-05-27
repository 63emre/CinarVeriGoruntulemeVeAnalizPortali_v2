import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import { evaluateFormula } from '@/lib/formula/formula-service';
import * as z from 'zod';

// Schema for formula evaluation request
const EvaluationRequestSchema = z.object({
  formula: z.string().min(1, 'Formül ifadesi zorunludur'),
  variables: z.record(z.number()),
});

// POST: Evaluate a formula with provided variables
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
    const data = await request.json();
    
    try {
      const validatedData = EvaluationRequestSchema.parse(data);
      
      // Evaluate the formula
      const result = evaluateFormula(
        validatedData.formula, 
        { variables: validatedData.variables }
      );

      return NextResponse.json(result);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { message: 'Validation error', errors: validationError.errors },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Error evaluating formula:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message },
      { status: 500 }
    );
  }
} 