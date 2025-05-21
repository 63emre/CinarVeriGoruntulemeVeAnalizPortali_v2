'use client';

import { Suspense } from 'react';
import AnalysisContent from '@/components/analysis/AnalysisContent';

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