'use client';

import { Suspense } from 'react';
import FormulasContent from '@/components/formulas/FormulasContent';

export default function FormulasPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <FormulasContent />
    </Suspense>
  );
} 