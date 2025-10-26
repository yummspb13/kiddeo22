import type { NextRequest } from 'next/server'

type Handler<T> = (req: NextRequest) => Promise<T>

export interface ApiGuardOptions {
  route: string
  timeoutMs?: number
  maxConcurrency?: number
}

const routeLocks = new Map<string, number>()

export function withApiGuard<T>(handler: Handler<T>, opts: ApiGuardOptions): Handler<T> {
  const timeoutMs = opts.timeoutMs ?? 5000
  const maxConc = opts.maxConcurrency ?? 2

  return async (req: NextRequest) => {
    const started = Date.now()
    const key = opts.route

    // Concurrency guard
    const current = routeLocks.get(key) || 0
    if (current >= maxConc) {
      // Reject fast to avoid piling up
      throw Object.assign(new Error('Too many concurrent requests'), {
        status: 429,
        meta: { route: key, current }
      })
    }
    routeLocks.set(key, current + 1)

    try {
      const result = await Promise.race<Promise<T | { __timeout: true }>>([
        handler(req) as unknown as Promise<T>,
        new Promise(resolve => setTimeout(() => resolve({ __timeout: true }), timeoutMs)) as any
      ])

      const duration = Date.now() - started
      if ((result as any)?.__timeout) {
        throw Object.assign(new Error('Request timeout'), {
          status: 504,
          meta: { route: key, duration }
        })
      }

      if (duration > 1000) {
        console.warn(`⚠️ Slow API ${key} in ${duration}ms`)
      }
      return result as T
    } finally {
      const after = (routeLocks.get(key) || 1) - 1
      if (after <= 0) routeLocks.delete(key); else routeLocks.set(key, after)
    }
  }
}


