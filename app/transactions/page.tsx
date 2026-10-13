import type { Metadata } from 'next'
import { Suspense } from 'react'
import { TransactionsPageSkeleton } from '@/components/transactions/TransactionsPageSkeleton'
import { TransactionsView } from '@/components/transactions/TransactionsView'

export const metadata: Metadata = { title: 'Transactions' }

export default function TransactionsPage() {
  // useSearchParams needs a Suspense boundary; the fallback is what shows before hydration.
  return (
    <Suspense fallback={<TransactionsPageSkeleton />}>
      <TransactionsView />
    </Suspense>
  )
}
