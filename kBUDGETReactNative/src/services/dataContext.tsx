import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { DataStore } from '@/services/dataStore';

const DataStoreContext = createContext<DataStore | null>(null);

export const DataProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [store] = useState(() => new DataStore());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    store.initialize().then(() => setReady(true));
  }, [store]);

  const value = useMemo(() => store, [store]);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f141a' }}>
        <ActivityIndicator color="#35c759" />
      </View>
    );
  }

  return <DataStoreContext.Provider value={value}>{children}</DataStoreContext.Provider>;
};

export const useDataStore = (): DataStore => {
  const ctx = useContext(DataStoreContext);
  if (!ctx) {
    throw new Error('useDataStore must be used within a DataProvider');
  }
  return ctx;
};
