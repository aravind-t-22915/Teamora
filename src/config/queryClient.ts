// src/config/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:   1000 * 60 * 2,   // 2 min
      gcTime:      1000 * 60 * 10,  // 10 min
      retry:       2,
      refetchOnWindowFocus: false,
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage:      AsyncStorage,
  throttleTime: 1000,
});
