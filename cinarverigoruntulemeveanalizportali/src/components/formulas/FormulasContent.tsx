'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import FormulaManagementPage from './FormulaManagementPage';

function FormulasContentInner() {
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get('workspaceId');

  // Use the enhanced formula management page
  return <FormulaManagementPage workspaceId={workspaceId || ''} />;
}

export default function FormulasContent() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <FormulasContentInner />
    </Suspense>
  );
} 