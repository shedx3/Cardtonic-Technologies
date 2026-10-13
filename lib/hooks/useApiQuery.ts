'use client'
import { useCallback, useEffect, useEffectEvent, useState } from 'react'
import { isAbortError } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'

type Settled<T> =
  { key: string; res: ApiSuccess<T>; error?: undefined } | { key: string; error: unknown; res?: undefined }

export interface ApiQueryState<T> {
  /** Latest successful response, which may belong to a previous key while the next one loads. */
  data: ApiSuccess<T> | undefined
  /** True when the response for the *current* key failed; `error` holds the reason. */
  isError: boolean
  error: unknown
  /** True while the response for the current key has not arrived. */
  isLoading: boolean
  /** Re-run the current request. */
  retry: () => void
}

/**
 * Fetch `fetcher` whenever `key` changes. Earlier requests are aborted so a slow response can never
 * overwrite a newer one, and the last successful data is kept while the next request is in flight.
 * Pass `key: null` to stay idle.
 */
export function useApiQuery<T>(
  key: string | null,
  fetcher: (signal: AbortSignal) => Promise<ApiSuccess<T>>
): ApiQueryState<T> {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<Settled<T>>()
  const [lastSuccess, setLastSuccess] = useState<ApiSuccess<T>>()
  const requestKey = key === null ? null : `${key}#${attempt}`
  const run = useEffectEvent(fetcher)

  useEffect(() => {
    if (requestKey === null) return
    const controller = new AbortController()
    run(controller.signal).then(
      (res) => {
        if (controller.signal.aborted) return
        setSettled({ key: requestKey, res })
        setLastSuccess(res)
      },
      (error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) return
        setSettled({ key: requestKey, error })
      }
    )
    return () => controller.abort()
  }, [requestKey])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  const isCurrent = settled !== undefined && settled.key === requestKey

  return {
    data: lastSuccess,
    isError: isCurrent && settled.res === undefined,
    error: isCurrent ? settled.error : undefined,
    isLoading: requestKey !== null && !isCurrent,
    retry,
  }
}
