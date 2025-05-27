'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FcFolder } from 'react-icons/fc';

interface WorkspaceSelectorProps {
  currentWorkspaceId?: string;
  onWorkspaceSelect?: (workspaceId: string) => void;
}

interface Workspace {
  id: string;
  name: string;
  description: string | null;
}

export default function WorkspaceSelector({ currentWorkspaceId, onWorkspaceSelect }: WorkspaceSelectorProps) {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(currentWorkspaceId || null);
  
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/workspaces');
        
        if (!response.ok) {
          throw new Error('Çalışma alanları yüklenemedi');
        }
        
        const data = await response.json();
        setWorkspaces(data);
        
        // If there's no current workspace but we have workspaces, select the first one
        if (!currentWorkspaceId && data.length > 0 && !selectedWorkspaceId) {
          setSelectedWorkspaceId(data[0].id);
          if (onWorkspaceSelect) {
            onWorkspaceSelect(data[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching workspaces:', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkspaces();
  }, [currentWorkspaceId, onWorkspaceSelect]);
  
  const handleWorkspaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const workspaceId = e.target.value;
    setSelectedWorkspaceId(workspaceId);
    
    if (onWorkspaceSelect) {
      onWorkspaceSelect(workspaceId);
    } else {
      // If no callback provided, navigate to the workspace
      router.push(`/dashboard/workspaces/${workspaceId}`);
    }
  };
  
  if (loading) {
    return (
      <div className="relative">
        <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-red-500 text-sm">
        Çalışma alanları yüklenemedi: {error}
      </div>
    );
  }
  
  if (workspaces.length === 0) {
    return (
      <div className="text-gray-500 text-sm flex items-center">
        <FcFolder className="mr-1" />
        Henüz çalışma alanı yok
      </div>
    );
  }
  
  return (
    <div className="flex items-center">
      <FcFolder className="mr-2 h-5 w-5 flex-shrink-0" />
      <div className="relative w-full">
        <select
          value={selectedWorkspaceId || ''}
          onChange={handleWorkspaceChange}
          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
        >
          <option value="" disabled>Çalışma Alanı Seçin</option>
          {workspaces.map((workspace) => (
            <option key={workspace.id} value={workspace.id}>
              {workspace.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
