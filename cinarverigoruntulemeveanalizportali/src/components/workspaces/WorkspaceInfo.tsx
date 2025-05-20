'use client';

import { FcFolder, FcDataSheet, FcAddRow } from 'react-icons/fc';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface WorkspaceInfoProps {
  workspace: {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    _count?: {
      tables: number;
      formulas: number;
    };
  };
}

export default function WorkspaceInfo({ workspace }: WorkspaceInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-wrap items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <FcFolder className="mr-3 h-8 w-8" />
          {workspace.name}
        </h1>
        
        <div className="mt-2 flex flex-wrap gap-3">
          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center">
            <FcDataSheet className="mr-1" />
            {workspace._count?.tables || 0} Tablo
          </div>
          
          <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center">
            <FcAddRow className="mr-1" />
            {workspace._count?.formulas || 0} Formül
          </div>
        </div>
      </div>
      
      {workspace.description && (
        <p className="text-gray-600 mb-4">{workspace.description}</p>
      )}
      
      <div className="text-sm text-gray-500">
        <span>Oluşturulma: {formatDistanceToNow(new Date(workspace.createdAt), { addSuffix: true, locale: tr })}</span>
      </div>
    </div>
  );
} 