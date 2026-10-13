import { afterEach, vi } from 'vitest'
import { ApiError, api } from './client'

const respond = (body: BodyInit | null, status = 200) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(body, { status }))

afterEach(() => vi.restoreAllMocks())

describe('api client', () => {
  it('resolves to the body on success', async () => {
    respond(JSON.stringify({ data: [1], meta: { page: 1 } }))
    await expect(api.get('/x')).resolves.toEqual({ data: [1], meta: { page: 1 } })
  })

  it('throws an ApiError carrying the API error body on 4xx/5xx', async () => {
    respond(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'nope' } }), 404)
    await expect(api.get('/x')).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND', message: 'nope' })
  })

  it('throws an ApiError when the response is not JSON', async () => {
    respond('<html>Bad gateway</html>', 502)
    await expect(api.get('/x')).rejects.toBeInstanceOf(ApiError)
  })

  it('forwards the abort signal', async () => {
    const spy = respond(JSON.stringify({ data: null }))
    const controller = new AbortController()
    await api.get('/x', { signal: controller.signal })
    expect(spy.mock.calls[0][1]?.signal).toBe(controller.signal)
  })
})
