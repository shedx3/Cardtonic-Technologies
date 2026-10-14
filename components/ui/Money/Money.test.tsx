import { render, screen } from '@testing-library/react'
import { Money } from './Money'

describe('Money', () => {
  it('always shows two decimals', () => {
    render(<Money amount={150000} currency="NGN" />)
    expect(screen.getByText('₦1,500.00')).toBeInTheDocument()
  })

  it('uses the full currency symbol', () => {
    render(<Money amount={120000} currency="GHS" />)
    expect(screen.getByText('GH₵1,200.00')).toBeInTheDocument()
  })

  it('signs credits and debits', () => {
    render(
      <>
        <Money amount={2500000} currency="NGN" sign="credit" />
        <Money amount={4599} currency="USD" sign="debit" />
      </>
    )
    expect(screen.getByText('+₦25,000.00')).toBeInTheDocument()
    expect(screen.getByText('-$45.99')).toBeInTheDocument()
  })
})
