import type { TransactionStatus, TransactionType } from '@/types/api'

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  transfer_in: 'Transfer in',
  transfer_out: 'Transfer out',
  conversion: 'Conversion',
  card_payment: 'Card payment',
  bill_payment: 'Bill payment',
}

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  successful: 'Successful',
  pending: 'Pending',
  failed: 'Failed',
}

const CREDIT_TYPES: readonly TransactionType[] = ['deposit', 'transfer_in', 'conversion']

/** Credits add to the wallet and are shown with "+"; everything else is a debit. */
export const isCredit = (type: TransactionType) => CREDIT_TYPES.includes(type)

/** "Ada Okafor" -> "AO", "Okonkwo-Adeyemi Logistics" -> "OA". Null when there is nothing usable. */
export function getInitials(name: string | null): string | null {
  if (!name) return null
  const letters = name
    .split(/[\s-]+/)
    .map((word) => Array.from(word).find((char) => /[\p{L}\p{N}]/u.test(char)))
    .filter((char): char is string => Boolean(char))
    .slice(0, 2)
  return letters.length ? letters.join('').toUpperCase() : null
}
