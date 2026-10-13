import type { Currency } from '@/types/api'
import { cx } from '@/lib/cx'
import { formatMoney } from '@/lib/format'
import styles from './Money.module.css'

export interface MoneyProps {
  /** Minor units. Always positive for transactions; the sign is applied from `sign`. */
  amount: number
  currency: Currency
  /** Prefix with + or -. */
  sign?: 'credit' | 'debit'
  className?: string
}

export function Money({ amount, currency, sign, className }: MoneyProps) {
  const text =
    sign === 'credit'
      ? formatMoney(Math.abs(amount), currency, { signDisplay: 'always' })
      : sign === 'debit'
        ? formatMoney(-Math.abs(amount), currency, { signDisplay: 'always' })
        : formatMoney(amount, currency)
  return <span className={cx(styles.money, className)}>{text}</span>
}
