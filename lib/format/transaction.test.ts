import { formatDayHeading } from './date'
import { getInitials, isCredit } from './transaction'

describe('getInitials', () => {
  it('uses the first letters of the first two words', () => {
    expect(getInitials('Ada Okafor')).toBe('AO')
    expect(getInitials('Kwame Mensah Jr')).toBe('KM')
  })

  it('splits hyphenated names and ignores punctuation', () => {
    expect(getInitials('Okonkwo-Adeyemi Logistics & Haulage International Ltd')).toBe('OA')
    expect(getInitials('& Co Ltd')).toBe('CL')
  })

  it('returns null when there is no usable name', () => {
    expect(getInitials(null)).toBeNull()
    expect(getInitials('  ')).toBeNull()
    expect(getInitials('---')).toBeNull()
  })
})

describe('isCredit', () => {
  it('treats money-in types as credits', () => {
    expect(isCredit('deposit')).toBe(true)
    expect(isCredit('transfer_in')).toBe(true)
    expect(isCredit('card_payment')).toBe(false)
    expect(isCredit('transfer_out')).toBe(false)
  })
})

describe('formatDayHeading', () => {
  const now = new Date(2026, 9, 8, 12, 0)

  it('labels today and yesterday', () => {
    expect(formatDayHeading(new Date(2026, 9, 8, 0, 5).toISOString(), now)).toBe('Today')
    expect(formatDayHeading(new Date(2026, 9, 7, 23, 55).toISOString(), now)).toBe('Yesterday')
  })

  it('uses a full date for older days', () => {
    expect(formatDayHeading(new Date(2026, 9, 5, 10, 15).toISOString(), now)).toBe('Mon, 5 Oct 2026')
  })
})
