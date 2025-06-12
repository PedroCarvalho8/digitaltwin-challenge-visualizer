import React, { createContext, useState, ReactNode, useContext } from 'react';

export type Fonte = 'mock' | 'api' | 'localhost';

interface DataSourceContextData {
  fonte: Fonte;
  apiUrl: string;
  setFonte: (fonte: Fonte) => void;
  setApiUrl: (url: string) => void;
}

const DataSourceContext = createContext<DataSourceContextData | undefined>(undefined);

export const DataSourceProvider = ({ children }: { children: ReactNode }) => {
  const [fonte, setFonte] = useState<Fonte>('mock');
  const [apiUrl, setApiUrl] = useState<string>('');

  return (
    <DataSourceContext.Provider value={{ fonte, apiUrl, setFonte, setApiUrl }}>
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
