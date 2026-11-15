import * as Sentry from "@sentry/react"
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import {
  PersistedClient,
  Persister,
} from "@tanstack/react-query-persist-client"
import { createStore, del, get, set } from "idb-keyval"

// Previously the query cache was persisted to localStorage under this key.
// localStorage is capped at ~5MB, which is why we couldn't persist larger
// queries like the recipe list.
const CACHE_KEY = "REACT_QUERY_OFFLINE_CACHE"

// Bump to discard every client's persisted query cache, including in dev where
// API_GIT_TREE_SHA is always "dev" and wouldn't change between builds.
export const QUERY_CACHE_VERSION = 3

// Matches the default throttle of TanStack's storage persisters.
const THROTTLE_MS = 1000

function reportError(error: unknown) {
  Sentry.captureException(error)
  // eslint-disable-next-line no-console
  console.error("problem persisting")
  // eslint-disable-next-line no-console
  console.error(error)
}

/**
 * Persists the query cache to IndexedDB as a plain object.
 *
 * IndexedDB stores values via structured clone, so unlike localStorage we can
 * skip the `JSON.stringify` / `JSON.parse` round trip on every save and
 * restore.
 */
function createIdbPersister(): Persister {
  const store = createStore("recipeyak", "react-query")

  let pending: PersistedClient | null = null
  let timer: ReturnType<typeof setTimeout> | null = null

  async function flush() {
    timer = null
    const client = pending
    pending = null
    if (client == null) {
      return
    }
    try {
      await set(CACHE_KEY, client, store)
    } catch (error) {
      reportError(error)
    }
  }

  return {
    persistClient(client) {
      // Trailing throttle: always write the latest snapshot.
      pending = client
      if (timer == null) {
        timer = setTimeout(() => {
          void flush()
        }, THROTTLE_MS)
      }
    },
    async restoreClient() {
      try {
        return await get<PersistedClient>(CACHE_KEY, store)
      } catch (error) {
        reportError(error)
        return undefined
      }
    },
    async removeClient() {
      pending = null
      if (timer != null) {
        clearTimeout(timer)
        timer = null
      }
      await del(CACHE_KEY, store)
    },
  }
}

function cleanupLegacyCache() {
  try {
    // eslint-disable-next-line no-restricted-globals
    localStorage.removeItem(CACHE_KEY)
  } catch {
    // ignore
  }
}

function createPersister(): Persister {
  // IndexedDB can be unavailable (e.g. some private browsing modes), in which
  // case we fall back to localStorage.
  if (typeof indexedDB === "undefined") {
    return createSyncStoragePersister({
      // eslint-disable-next-line no-restricted-globals
      storage: localStorage,
      key: CACHE_KEY,
      retry: ({ error }) => {
        reportError(error)
        return undefined
      },
    })
  }
  cleanupLegacyCache()
  return createIdbPersister()
}

export const persister = createPersister()
