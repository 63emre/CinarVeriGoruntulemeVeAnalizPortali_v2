'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MultiChartAnalysis from '@/components/analysis/MultiChartAnalysis';

function AnalysisContent() {
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get('workspaceId') || '';
  const tableId = searchParams.get('tableId') || undefined;

  return <MultiChartAnalysis workspaceId={workspaceId} tableId={tableId} />;
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  );
} 