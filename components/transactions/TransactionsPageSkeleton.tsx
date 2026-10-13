'use client'
import { TransactionFilters } from './TransactionFilters'
import { TransactionListSkeleton } from './TransactionListSkeleton'
import styles from './TransactionsView.module.css'

const noop = () => {}

/** What renders before the client has read the URL: same header and filter bar, inert, over a loading list. */
export function TransactionsPageSkeleton() {
  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>Transactions</h1>
        <p className={styles.subtitle}>&nbsp;</p>
      </header>
      <div inert>
        <TransactionFilters
          search=""
          type=""
          status=""
          showClear={false}
          onSearchChange={noop}
          onTypeChange={noop}
          onStatusChange={noop}
          onClear={noop}
        />
      </div>
      <TransactionListSkeleton />
    </div>
  )
}
