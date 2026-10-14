import { hasActiveFilters, parseFilters, patchSearchParams } from './url'

const params = (qs: string) => new URLSearchParams(qs)

describe('parseFilters', () => {
  it('reads valid values', () => {
    expect(parseFilters(params('q=netflix&type=card_payment&status=pending&page=3'))).toEqual({
      q: 'netflix',
      type: 'card_payment',
      status: 'pending',
      page: 3,
    })
  })

  it('falls back to defaults for invalid values', () => {
    expect(parseFilters(params('type=nope&status=reversed&page=0'))).toEqual({
      q: '',
      type: '',
      status: '',
      page: 1,
    })
    expect(parseFilters(params('page=abc')).page).toBe(1)
    expect(parseFilters(params('page=2.5')).page).toBe(1)
    expect(parseFilters(params('page=-4')).page).toBe(1)
  })
})

describe('patchSearchParams', () => {
  it('resets the page when a filter changes', () => {
    expect(patchSearchParams(params('page=4&type=deposit'), { status: 'failed' })).toBe(
      'type=deposit&status=failed'
    )
  })

  it('keeps the page when only paginating', () => {
    expect(patchSearchParams(params('q=a'), { page: 2 })).toBe('q=a&page=2')
    expect(patchSearchParams(params('q=a&page=2'), { page: 1 })).toBe('q=a')
  })

  it('removes empty values and trims search text', () => {
    expect(patchSearchParams(params('q=a&type=deposit'), { q: '  ', type: '' })).toBe('')
    expect(patchSearchParams(params(''), { q: ' hi ' })).toBe('q=hi')
  })

  it('preserves params it does not manage', () => {
    expect(patchSearchParams(params('__scenario=slow'), { type: 'deposit' })).toBe(
      '__scenario=slow&type=deposit'
    )
  })

  it('opens and closes details without touching filters', () => {
    expect(patchSearchParams(params('q=a&page=2'), { tx: 'txn_1' })).toBe('q=a&page=2&tx=txn_1')
    expect(patchSearchParams(params('q=a&page=2&tx=txn_1'), { tx: null })).toBe('q=a&page=2')
  })
})

describe('hasActiveFilters', () => {
  it('ignores the page', () => {
    expect(hasActiveFilters({ q: '', type: '', status: '', page: 3 })).toBe(false)
    expect(hasActiveFilters({ q: 'a', type: '', status: '', page: 1 })).toBe(true)
  })
})
