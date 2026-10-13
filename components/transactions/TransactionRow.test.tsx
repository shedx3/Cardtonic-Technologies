import { render, screen } from '@testing-library/react'
import type { Transaction } from '@/types/api'
import { TransactionRow } from './TransactionRow'

const tx: Transaction = {
  id: 'txn_1',
  reference: 'ACM-1',
  type: 'transfer_out',
  status: 'pending',
  currency: 'GHS',
  amount: 120000,
  fee: 1200,
  narration: 'Pay <img src=x onerror="alert(1)"> now',
  counterparty: 'Kwame Mensah',
  createdAt: '2026-10-05T10:15:00.000Z',
}

describe('TransactionRow', () => {
  it('renders narration as text, never as HTML', () => {
    const { container } = render(<TransactionRow transaction={tx} />)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText(/<img src=x/)).toBeInTheDocument()
  })

  it('shows a signed amount, status and counterparty initials', () => {
    render(<TransactionRow transaction={tx} showDate={false} />)
    expect(screen.getByText('-GH₵1,200.00')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('KM')).toBeInTheDocument()
  })
})
