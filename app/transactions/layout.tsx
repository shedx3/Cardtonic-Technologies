import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = { title: 'Transactions' }

export default function TransactionsLayout({ children }: { children: ReactNode }) {
  return children
}
