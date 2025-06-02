'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface RefreshData {
  timestamp: number;
  workspaceId: string;
  tableId?: string;
}

interface RefreshContextType {
  lastRefresh: RefreshData | null;
  triggerRefresh: (workspaceId: string, tableId?: string) => void;
  isRefreshing: boolean;
  refreshCount: number;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

interface RefreshProviderProps {
  children: ReactNode;
}

export function RefreshProvider({ children }: RefreshProviderProps) {
  const [lastRefresh, setLastRefresh] = useState<RefreshData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  // Listen for formula data refresh events
  useEffect(() => {
    const handleFormulaRefresh = (event: CustomEvent<RefreshData>) => {
      console.log('🔄 Formula refresh event received:', event.detail);
      setLastRefresh(event.detail);
      setRefreshCount(prev => prev + 1);
      
      // Set refreshing state for a brief moment to show loading indicators
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 1000);
    };

    // Listen for localStorage changes from other tabs/components
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'formulaRefreshNeeded' && event.newValue) {
        try {
          const refreshData: RefreshData = JSON.parse(event.newValue);
          console.log('🔄 Storage refresh event received:', refreshData);
          setLastRefresh(refreshData);
          setRefreshCount(prev => prev + 1);
          setIsRefreshing(true);
          setTimeout(() => setIsRefreshing(false), 1000);
        } catch (error) {
          console.error('Error parsing refresh data from storage:', error);
        }
      }
    };

    // Also check localStorage on mount for any pending refreshes
    const checkPendingRefresh = () => {
      const pendingRefresh = localStorage.getItem('formulaRefreshNeeded');
      if (pendingRefresh) {
        try {
          const refreshData: RefreshData = JSON.parse(pendingRefresh);
          const age = Date.now() - refreshData.timestamp;
          
          // Only process if refresh is less than 5 minutes old
          if (age < 5 * 60 * 1000) {
            console.log('🔄 Processing pending refresh:', refreshData);
            setLastRefresh(refreshData);
            setRefreshCount(prev => prev + 1);
          }
          
          // Clear the localStorage item
          localStorage.removeItem('formulaRefreshNeeded');
        } catch (error) {
          console.error('Error processing pending refresh:', error);
          localStorage.removeItem('formulaRefreshNeeded');
        }
      }
    };

    // Add event listeners
    window.addEventListener('formulaDataRefresh', handleFormulaRefresh as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    // Check for pending refreshes
    checkPendingRefresh();

    return () => {
      window.removeEventListener('formulaDataRefresh', handleFormulaRefresh as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const triggerRefresh = (workspaceId: string, tableId?: string) => {
    const refreshData: RefreshData = {
      timestamp: Date.now(),
      workspaceId,
      tableId
    };
    
    console.log('🔄 Manually triggering refresh:', refreshData);
    setLastRefresh(refreshData);
    setRefreshCount(prev => prev + 1);
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
    
    // Also dispatch the event for other components
    const refreshEvent = new CustomEvent('formulaDataRefresh', {
      detail: refreshData
    });
    window.dispatchEvent(refreshEvent);
  };

  const value: RefreshContextType = {
    lastRefresh,
    triggerRefresh,
    isRefreshing,
    refreshCount
  };

  return (
    <RefreshContext.Provider value={value}>
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  const context = useContext(RefreshContext);
  if (context === undefined) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
}

// Hook for components that need to refresh when formulas change
export function useFormulaRefresh(
  workspaceId: string,
  tableId?: string,
  onRefresh?: () => void | Promise<void>
) {
  const { lastRefresh, isRefreshing } = useRefresh();

  useEffect(() => {
    if (!lastRefresh) return;

    // Check if this refresh applies to current component
    const shouldRefresh = 
      lastRefresh.workspaceId === workspaceId &&
      (
        // Workspace-wide refresh (no tableId specified)
        !lastRefresh.tableId ||
        // Specific table refresh
        lastRefresh.tableId === tableId ||
        // Component doesn't specify table (accepts all refreshes)
        !tableId
      );

    if (shouldRefresh && onRefresh) {
      console.log(`🔄 Executing refresh for workspace: ${workspaceId}, table: ${tableId || 'all'}`);
      
      const executeRefresh = async () => {
        try {
          await onRefresh();
        } catch (error) {
          console.error('Error during refresh callback:', error);
        }
      };
      
      executeRefresh();
    }
  }, [lastRefresh, workspaceId, tableId, onRefresh]);

  return { isRefreshing };
}

export type { RefreshData, RefreshContextType }; 