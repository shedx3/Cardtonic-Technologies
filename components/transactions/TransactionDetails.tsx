'use client'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Transaction } from '@/types/api'
import { Badge, Button, Icon, Money, Skeleton, StateMessage } from '@/components/ui'
import {
  formatDateTime,
  formatMoney,
  isCredit,
  TRANSACTION_STATUS_LABELS,
  TRANSACTION_TYPE_LABELS,
} from '@/lib/format'
import { STATUS_TONES, TransactionIcon } from './TransactionRow'
import styles from './TransactionDetails.module.css'

function summaryLine(tx: Transaction) {
  const label = TRANSACTION_TYPE_LABELS[tx.type]
  if (!tx.counterparty) return label
  if (tx.type === 'transfer_out') return `${label} to ${tx.counterparty}`
  if (tx.type === 'transfer_in') return `${label} from ${tx.counterparty}`
  return `${label} · ${tx.counterparty}`
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.row}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function CopyReference({ reference }: { reference: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reference)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard can be unavailable (insecure context, denied permission). The reference stays selectable.
    }
  }

  return (
    <span className={styles.reference}>
      <span className={styles.mono}>{reference}</span>
      <button type="button" className={styles.copy} onClick={copy} aria-label="Copy reference">
        <Icon name="copy" size={14} />
      </button>
      <span role="status" className="visually-hidden">
        {copied ? 'Reference copied' : ''}
      </span>
    </span>
  )
}

export function TransactionDetails({ transaction: tx }: { transaction: Transaction }) {
  const credit = isCredit(tx.type)
  return (
    <div className={styles.details}>
      <div className={styles.hero}>
        <span className={styles.avatar}>
          <TransactionIcon transaction={tx} size={20} />
        </span>
        <p className={styles.summary}>{summaryLine(tx)}</p>
        <Money
          amount={tx.amount}
          currency={tx.currency}
          sign={credit ? 'credit' : 'debit'}
          className={styles.amount}
        />
        <Badge tone={STATUS_TONES[tx.status]} dot>
          {TRANSACTION_STATUS_LABELS[tx.status]}
        </Badge>
      </div>

      <section aria-labelledby="details-heading">
        <h3 id="details-heading" className={styles.section}>
          Details
        </h3>
        <dl>
          <Row label="Reference">
            <CopyReference reference={tx.reference} />
          </Row>
          <Row label="Date">{formatDateTime(tx.createdAt)}</Row>
          <Row label="Type">{TRANSACTION_TYPE_LABELS[tx.type]}</Row>
          {tx.counterparty && <Row label="Counterparty">{tx.counterparty}</Row>}
          <Row label="Narration">{tx.narration}</Row>
        </dl>
      </section>

      <section aria-labelledby="summary-heading">
        <h3 id="summary-heading" className={styles.section}>
          Summary
        </h3>
        <dl>
          <Row label="Amount">{formatMoney(tx.amount, tx.currency)}</Row>
          <Row label="Fee">{formatMoney(tx.fee, tx.currency)}</Row>
          <Row label="Total">
            <strong>{formatMoney(tx.amount + tx.fee, tx.currency)}</strong>
          </Row>
        </dl>
      </section>
    </div>
  )
}

export function TransactionDetailsSkeleton() {
  return (
    <div className={styles.details} aria-busy="true">
      <div role="status" className="visually-hidden">
        Loading transaction…
      </div>
      <div className={styles.hero}>
        <Skeleton circle height={48} />
        <Skeleton width={160} height={12} />
        <Skeleton width={200} height={28} />
        <Skeleton width={72} height={22} />
      </div>
      <div className={styles.skeletonRows}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={styles.row}>
            <Skeleton width={72} height={12} />
            <Skeleton width={110} height={12} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function TransactionNotFound({ onBack }: { onBack: () => void }) {
  return (
    <StateMessage
      bare
      icon="search"
      title="Transaction not found"
      description="It may have been removed, or the link is wrong."
      action={
        <Button variant="secondary" onClick={onBack}>
          Back to transactions
        </Button>
      }
    />
  )
}

export function TransactionDetailsError({ onRetry }: { onRetry: () => void }) {
  return (
    <StateMessage
      bare
      icon="alert"
      tone="danger"
      title="We couldn’t load this transaction"
      description="Check your connection and try again."
      action={
        <Button iconLeft="refresh" onClick={onRetry}>
          Try again
        </Button>
      }
    />
  )
}
