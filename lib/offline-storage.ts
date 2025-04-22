// IndexedDB configuration
const DB_NAME = "pocketwindryft_offline_db"
const DB_VERSION = 1

// Initialize the IndexedDB
function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = (event) => {
      console.error("IndexedDB error:", event)
      reject("Error opening IndexedDB")
    }

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create object stores for different data types
      if (!db.objectStoreNames.contains("sessions")) {
        const sessionsStore = db.createObjectStore("sessions", { keyPath: "id" })
        sessionsStore.createIndex("userId", "userId", { unique: false })
      }

      if (!db.objectStoreNames.contains("pendingSync")) {
        db.createObjectStore("pendingSync", { keyPath: "id", autoIncrement: true })
      }
    }
  })
}

// Save data to IndexedDB
export async function saveToIndexedDB<T extends { id: string }>(storeName: string, data: T): Promise<void> {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onsuccess = () => resolve()
      request.onerror = (event) => {
        console.error(`Error saving to ${storeName}:`, event)
        reject(`Error saving to ${storeName}`)
      }
      transaction.oncomplete = () => db.close()
    })
  } catch (error) {
    console.error("IndexedDB save error:", error)
    throw error
  }
}

// Get all items from IndexedDB by index
export async function getAllFromIndexedDB<T>(storeName: string, indexName?: string, indexValue?: string): Promise<T[]> {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly")
      const store = transaction.objectStore(storeName)

      let request: IDBRequest

      if (indexName && indexValue !== undefined) {
        const index = store.index(indexName)
        request = index.getAll(indexValue)
      } else {
        request = store.getAll()
      }

      request.onsuccess = () => resolve(request.result as T[])
      request.onerror = (event) => {
        console.error(`Error getting from ${storeName}:`, event)
        reject(`Error getting from ${storeName}`)
      }
      transaction.oncomplete = () => db.close()
    })
  } catch (error) {
    console.error("IndexedDB get error:", error)
    return []
  }
}

// Check if the device is online
export function isOnline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine
}

// Background sync functionality
interface SyncRequest {
  id?: number
  url: string
  method: string
  headers: Record<string, string>
  body: string
}

// Add a request to the pending sync queue
export async function addPendingSync(request: SyncRequest): Promise<void> {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("pendingSync", "readwrite")
      const store = transaction.objectStore("pendingSync")
      const addRequest = store.add(request)

      addRequest.onsuccess = () => resolve()
      addRequest.onerror = (event) => {
        console.error("Error adding pending sync:", event)
        reject("Error adding pending sync")
      }
      transaction.oncomplete = () => db.close()
    })
  } catch (error) {
    console.error("Error in addPendingSync:", error)
    throw error
  }
}

// Get all pending sync requests
async function getPendingSyncRequests(): Promise<SyncRequest[]> {
  return getAllFromIndexedDB<SyncRequest>("pendingSync")
}

// Remove a sync request after it's processed
async function removePendingSyncRequest(id: number): Promise<void> {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("pendingSync", "readwrite")
      const store = transaction.objectStore("pendingSync")
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = (event) => {
        console.error("Error removing pending sync:", event)
        reject("Error removing pending sync")
      }
      transaction.oncomplete = () => db.close()
    })
  } catch (error) {
    console.error("Error in removePendingSyncRequest:", error)
    throw error
  }
}

// Process all pending sync requests
async function processPendingSyncRequests(): Promise<void> {
  if (!isOnline()) return

  const requests = await getPendingSyncRequests()

  for (const request of requests) {
    try {
      await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      })

      if (request.id) {
        await removePendingSyncRequest(request.id)
      }
    } catch (error) {
      console.error("Error processing sync request:", error)
      // We don't remove the request so it can be retried later
    }
  }
}

// Register for background sync
export function registerBackgroundSync(): void {
  // Check if the browser supports ServiceWorker and Background Sync
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready
      .then((registration) => {
        // Register for background sync
        return registration.sync.register("sync-data")
      })
      .catch((err) => console.error("Background sync registration failed:", err))
  } else {
    // If background sync is not supported, try to process immediately if online
    if (isOnline()) {
      processPendingSyncRequests()
    }
  }
}

// Listen for online events to sync data
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    processPendingSyncRequests()
  })
}
