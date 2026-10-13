import { act, renderHook } from '@testing-library/react'
import type { ApiSuccess } from '@/types/api'
import { useApiQuery } from './useApiQuery'

const deferred = <T,>() => {
  let resolve!: (v: T) => void
  let reject!: (e: unknown) => void
  const promise = new Promise<T>((res, rej) => ((resolve = res), (reject = rej)))
  return { promise, resolve, reject }
}

describe('useApiQuery', () => {
  it('ignores a slow response for a key that is no longer current', async () => {
    const slow = deferred<ApiSuccess<string>>()
    const fast = deferred<ApiSuccess<string>>()
    const { result, rerender } = renderHook(
      ({ k }) => useApiQuery(k, () => (k === 'a' ? slow : fast).promise),
      {
        initialProps: { k: 'a' },
      }
    )
    rerender({ k: 'b' })
    await act(async () => fast.resolve({ data: 'B' }))
    await act(async () => slow.resolve({ data: 'A' }))
    expect(result.current.data?.data).toBe('B')
    expect(result.current.isLoading).toBe(false)
  })

  it('keeps previous data while the next key loads, and reports errors and retries', async () => {
    const calls: ReturnType<typeof deferred<ApiSuccess<string>>>[] = []
    const fetcher = () => {
      const d = deferred<ApiSuccess<string>>()
      calls.push(d)
      return d.promise
    }
    const { result, rerender } = renderHook(({ k }) => useApiQuery(k, fetcher), { initialProps: { k: 'a' } })
    await act(async () => calls[0].resolve({ data: 'A' }))
    rerender({ k: 'b' })
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data?.data).toBe('A')

    await act(async () => calls[1].reject(new Error('boom')))
    expect(result.current.isError).toBe(true)

    act(() => result.current.retry())
    expect(result.current.isError).toBe(false)
    await act(async () => calls[2].resolve({ data: 'B' }))
    expect(result.current.data?.data).toBe('B')
  })
})
