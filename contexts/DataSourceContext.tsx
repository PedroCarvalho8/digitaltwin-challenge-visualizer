import React, { createContext, useState, ReactNode, useContext, useCallback } from 'react';

export type Fonte = 'api' | 'localhost';

interface DataSourceContextData {
  fonte: Fonte;
  apiUrl: string;
  setFonte: (fonte: Fonte) => void;
  setApiUrl: (url: string) => void;
  refreshTrigger: number;
  notifyDataChanged: () => void;
}

const DataSourceContext = createContext<DataSourceContextData | undefined>(undefined);

export const DataSourceProvider = ({ children }: { children: ReactNode }) => {
  const [fonte, setFonte] = useState<Fonte>('localhost');
  const [apiUrl, setApiUrl] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const notifyDataChanged = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <DataSourceContext.Provider value={{ 
      fonte, 
      apiUrl, 
      setFonte, 
      setApiUrl,
      refreshTrigger,
      notifyDataChanged
    }}>
      {children}
    </DataSourceContext.Provider>
  );
};

export function useDataSource() {
  const context = useContext(DataSourceContext);
  if (!context) {
    throw new Error('useDataSource deve ser usado dentro de um DataSourceProvider');
  }
  return context;
}
