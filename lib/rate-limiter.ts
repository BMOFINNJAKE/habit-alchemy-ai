// Simple in-memory rate limiter
const userRequests = new Map<string, { count: number; resetTime: number }>()

// Default limits
const DEFAULT_RATE_LIMIT = 10 // requests per window
const DEFAULT_RATE_WINDOW = 60 * 1000 // 1 minute in milliseconds

export function checkRateLimit(
  userId: string,
  limit: number = DEFAULT_RATE_LIMIT,
  window: number = DEFAULT_RATE_WINDOW,
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()

  // Get or initialize user's request data
  let userData = userRequests.get(userId)
  if (!userData || now > userData.resetTime) {
    userData = { count: 0, resetTime: now + window }
    userRequests.set(userId, userData)
  }

  // Check if user has exceeded their limit
  const remaining = Math.max(0, limit - userData.count)
  const allowed = userData.count < limit

  // If allowed, increment the counter
  if (allowed) {
    userData.count++
    userRequests.set(userId, userData)
  }

  return {
    allowed,
    remaining,
    resetIn: Math.max(0, userData.resetTime - now),
  }
}

// Reset a specific user's rate limit
export function resetRateLimit(userId: string): void {
  userRequests.delete(userId)
}

// Reset all rate limits
export function resetAllRateLimits(): void {
  userRequests.clear()
}

// Get current rate limit status for a user
export function getRateLimitStatus(userId: string): {
  count: number
  resetTime: number
  remaining: number
} | null {
  const userData = userRequests.get(userId)
  if (!userData) return null

  return {
    count: userData.count,
    resetTime: userData.resetTime,
    remaining: Math.max(0, DEFAULT_RATE_LIMIT - userData.count),
  }
}
