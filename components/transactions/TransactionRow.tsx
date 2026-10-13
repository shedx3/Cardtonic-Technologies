import type { Transaction, TransactionStatus, TransactionType } from '@/types/api'
import { Badge, type BadgeTone, Icon, type IconName, Money } from '@/components/ui'
import {
  formatDateTime,
  formatMoney,
  getInitials,
  isCredit,
  TRANSACTION_STATUS_LABELS,
  TRANSACTION_TYPE_LABELS,
} from '@/lib/format'
import styles from './TransactionRow.module.css'

export const TYPE_ICONS: Record<TransactionType, IconName> = {
  deposit: 'arrow-down-left',
  transfer_in: 'arrow-down-left',
  withdrawal: 'arrow-up-right',
  transfer_out: 'arrow-up-right',
  conversion: 'swap',
  card_payment: 'card',
  bill_payment: 'receipt',
}

export const STATUS_TONES: Record<TransactionStatus, BadgeTone> = {
  successful: 'success',
  pending: 'warning',
  failed: 'danger',
}

/** Transfers show the counterparty's initials; everything else shows the type icon. */
export function TransactionIcon({ transaction: tx, size = 18 }: { transaction: Transaction; size?: number }) {
  const isTransfer = tx.type === 'transfer_in' || tx.type === 'transfer_out'
  const initials = isTransfer ? getInitials(tx.counterparty) : null
  return initials ? <span aria-hidden>{initials}</span> : <Icon name={TYPE_ICONS[tx.type]} size={size} />
}

export interface TransactionRowProps {
  transaction: Transaction
  onSelect?: (transaction: Transaction) => void
  /** Show the date under the amount. Off where rows are already grouped by day. */
  showDate?: boolean
}

export function TransactionRow({ transaction: tx, onSelect, showDate = true }: TransactionRowProps) {
  const credit = isCredit(tx.type)
  const typeLabel = TRANSACTION_TYPE_LABELS[tx.type]

  return (
    <button type="button" className={styles.row} onClick={() => onSelect?.(tx)}>
      <span className={styles.icon}>
        <TransactionIcon transaction={tx} />
      </span>
      <span className={styles.main}>
        <span className={styles.title}>{typeLabel}</span>
        {/* Rendered as text: narration comes from upstream providers and is not sanitised. */}
        <span className={styles.narration} title={tx.narration}>
          {tx.narration}
        </span>
      </span>
      <span className={styles.status}>
        <Badge tone={STATUS_TONES[tx.status]} dot>
          {TRANSACTION_STATUS_LABELS[tx.status]}
        </Badge>
      </span>
      <span className={styles.end}>
        <Money
          amount={tx.amount}
          currency={tx.currency}
          sign={credit ? 'credit' : 'debit'}
          className={credit ? styles.credit : styles.amount}
        />
        {showDate && (
          <span className={styles.meta}>
            {formatDateTime(tx.createdAt)}
            {tx.fee > 0 && ` · Fee ${formatMoney(tx.fee, tx.currency)}`}
          </span>
        )}
      </span>
    </button>
  )
}
