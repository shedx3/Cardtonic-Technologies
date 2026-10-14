import type { ApiErrorBody, ApiSuccess } from '@/types/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api'

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const isAbortError = (err: unknown) => err instanceof DOMException && err.name === 'AbortError'

/** Resolves to the parsed body, or throws an `ApiError` for non-2xx and unreadable responses. */
async function request<T>(path: string, init: RequestInit = {}): Promise<ApiSuccess<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })

  let body: unknown
  try {
    body = await res.json()
  } catch {
    // Gateways and proxies can answer with HTML or an empty body.
    throw new ApiError(res.status, 'INVALID_RESPONSE', 'Something went wrong. Please try again.')
  }

  if (!res.ok) {
    const error = (body as Partial<ApiErrorBody> | null)?.error
    throw new ApiError(
      res.status,
      error?.code ?? 'UNKNOWN_ERROR',
      error?.message ?? 'Something went wrong. Please try again.'
    )
  }
  return body as ApiSuccess<T>
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, init),
  post: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'POST', body: JSON.stringify(body) }),
}
