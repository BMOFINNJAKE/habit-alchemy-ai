// Simple in-memory cache for AI responses
const cache = new Map<string, { response: string; timestamp: number }>()

// Cache expiration time in milliseconds (default: 1 hour)
const CACHE_EXPIRATION = 60 * 60 * 1000

export function getCachedResponse(prompt: string): string | null {
  const cacheKey = createCacheKey(prompt)
  const cachedItem = cache.get(cacheKey)

  if (!cachedItem) return null

  // Check if cache has expired
  if (Date.now() - cachedItem.timestamp > CACHE_EXPIRATION) {
    cache.delete(cacheKey)
    return null
  }

  return cachedItem.response
}

export function cacheResponse(prompt: string, response: string): void {
  const cacheKey = createCacheKey(prompt)
  cache.set(cacheKey, {
    response,
    timestamp: Date.now(),
  })

  // Prune cache if it gets too large (keep it under 100 items)
  if (cache.size > 100) {
    const oldestKey = [...cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0]
    cache.delete(oldestKey)
  }
}

// Create a deterministic key for the cache
function createCacheKey(prompt: string): string {
  // Simple normalization: lowercase, trim whitespace, and remove extra spaces
  return prompt.toLowerCase().trim().replace(/\s+/g, " ")
}

// Clear the entire cache
export function clearCache(): void {
  cache.clear()
}

// Get cache statistics
export function getCacheStats() {
  return {
    size: cache.size,
    oldestEntry: cache.size > 0 ? Math.min(...[...cache.values()].map((v) => v.timestamp)) : null,
    newestEntry: cache.size > 0 ? Math.max(...[...cache.values()].map((v) => v.timestamp)) : null,
  }
}
