import { useState, useCallback, useRef } from 'react';

interface TabState {
  hasUnsavedChanges: boolean;
  lastSavedData: unknown;
  currentData: unknown;
}

interface UseTabStateReturn {
  tabStates: Record<string, TabState>;
  setTabData: (tabId: string, data: unknown) => void;
  markTabAsSaved: (tabId: string) => void;
  hasUnsavedChanges: (tabId: string) => boolean;
  hasAnyUnsavedChanges: () => boolean;
  resetTabState: (tabId: string) => void;
  confirmTabChange: (newTabId: string) => boolean;
}

export function useTabState(): UseTabStateReturn {
  const [tabStates, setTabStates] = useState<Record<string, TabState>>({});
  const currentTabRef = useRef<string>('');

  const setTabData = useCallback((tabId: string, data: unknown) => {
    setTabStates(prev => {
      const currentState = prev[tabId];
      const hasChanges = currentState 
        ? JSON.stringify(currentState.lastSavedData) !== JSON.stringify(data)
        : false;

      return {
        ...prev,
        [tabId]: {
          hasUnsavedChanges: hasChanges,
          lastSavedData: currentState?.lastSavedData || data,
          currentData: data
        }
      };
    });
  }, []);

  const markTabAsSaved = useCallback((tabId: string) => {
    setTabStates(prev => {
      const currentState = prev[tabId];
      if (!currentState) return prev;

      return {
        ...prev,
        [tabId]: {
          ...currentState,
          hasUnsavedChanges: false,
          lastSavedData: currentState.currentData
        }
      };
    });
  }, []);

  const hasUnsavedChanges = useCallback((tabId: string) => {
    return tabStates[tabId]?.hasUnsavedChanges || false;
  }, [tabStates]);

  const hasAnyUnsavedChanges = useCallback(() => {
    return Object.values(tabStates).some(state => state.hasUnsavedChanges);
  }, [tabStates]);

  const resetTabState = useCallback((tabId: string) => {
    setTabStates(prev => {
      const newStates = { ...prev };
      delete newStates[tabId];
      return newStates;
    });
  }, []);

  const confirmTabChange = useCallback((newTabId: string): boolean => {
    const currentTab = currentTabRef.current;
    
    if (currentTab && hasUnsavedChanges(currentTab)) {
      const confirmed = window.confirm(
        'У вас есть несохраненные изменения. Вы уверены, что хотите перейти на другую вкладку? Все несохраненные данные будут потеряны.'
      );
      
      if (!confirmed) {
        return false;
      }
      
      // Сбрасываем состояние текущей вкладки
      resetTabState(currentTab);
    }
    
    currentTabRef.current = newTabId;
    return true;
  }, [hasUnsavedChanges, resetTabState]);

  return {
    tabStates,
    setTabData,
    markTabAsSaved,
    hasUnsavedChanges,
    hasAnyUnsavedChanges,
    resetTabState,
    confirmTabChange
  };
}
