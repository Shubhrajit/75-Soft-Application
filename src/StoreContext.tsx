import React, { createContext, useContext, ReactNode } from 'react';
import { useAppStore as useLocalStore } from './store';

type StoreContextType = ReturnType<typeof useLocalStore>;

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useLocalStore();
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
