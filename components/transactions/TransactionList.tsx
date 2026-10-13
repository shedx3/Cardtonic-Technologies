import { Fragment } from 'react'
import type { Transaction } from '@/types/api'
import { Card } from '@/components/ui'
import { cx } from '@/lib/cx'
import { dayKey, formatDayHeading } from '@/lib/format'
import { TransactionRow } from './TransactionRow'
import styles from './TransactionList.module.css'

export interface TransactionListProps {
  transactions: Transaction[]
  onSelect: (transaction: Transaction) => void
  /** Dim the list while a newer response is on its way. */
  isRefreshing?: boolean
}

/** Transactions grouped under a heading per calendar day (Today, Yesterday, then dates). */
export function TransactionList({ transactions, onSelect, isRefreshing }: TransactionListProps) {
  const now = new Date()
  const groups: { key: string; heading: string; items: Transaction[] }[] = []
  for (const tx of transactions) {
    const key = dayKey(tx.createdAt)
    const last = groups[groups.length - 1]
    if (last?.key === key) last.items.push(tx)
    else groups.push({ key, heading: formatDayHeading(tx.createdAt, now), items: [tx] })
  }

  return (
    <Card
      padding="none"
      className={cx(styles.list, isRefreshing && styles.refreshing)}
      aria-busy={isRefreshing}
    >
      {groups.map((group) => (
        <Fragment key={group.key}>
          <h2 className={styles.heading}>{group.heading}</h2>
          {group.items.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} onSelect={onSelect} showDate={false} />
          ))}
        </Fragment>
      ))}
    </Card>
  )
}
