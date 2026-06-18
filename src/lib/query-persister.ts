import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type { PersistQueryClientOptions } from "@tanstack/react-query-persist-client";
import { clear, del, get, set } from "idb-keyval";

const IDB_KEY = "palpites:query-cache";
const CACHE_BUSTER = "v1";
const MAX_AGE = 1000 * 60 * 60 * 24 * 7;

const PERSISTED_QUERY_KEYS = ["teams", "tournament", "matches"] as const;

const idbStorage = {
  getItem: (key: string) => get<string>(key),
  setItem: (key: string, value: string) => set(key, value),
  removeItem: (key: string) => del(key),
};

export const queryPersister = createAsyncStoragePersister({
  storage: idbStorage,
  key: IDB_KEY,
  throttleTime: 1000,
});

export function clearQueryCache() {
  return clear();
}

export const persistOptions: Omit<PersistQueryClientOptions, "queryClient"> = {
  persister: queryPersister,
  maxAge: MAX_AGE,
  buster: CACHE_BUSTER,
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      const root = query.queryKey[0];
      return (
        typeof root === "string" &&
        (PERSISTED_QUERY_KEYS as readonly string[]).includes(root) &&
        query.state.status === "success"
      );
    },
  },
};
