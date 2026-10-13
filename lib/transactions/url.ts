import type { TransactionStatus, TransactionType } from '@/types/api'
import { TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'

/** What the user has selected on the Transactions page. The URL is the source of truth. */
export interface TransactionFilters {
  q: string
  type: TransactionType | ''
  status: TransactionStatus | ''
  page: number
}

export const PAGE_SIZE = 20

const TYPES = Object.keys(TRANSACTION_TYPE_LABELS) as TransactionType[]
const STATUSES = Object.keys(TRANSACTION_STATUS_LABELS) as TransactionStatus[]

/** Reads filters from a query string, ignoring values the API would reject. */
export function parseFilters(params: URLSearchParams): TransactionFilters {
  const type = params.get('type')
  const status = params.get('status')
  const page = Number(params.get('page'))
  return {
    q: params.get('q')?.trim() ?? '',
    type: TYPES.find((t) => t === type) ?? '',
    status: STATUSES.find((s) => s === status) ?? '',
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  }
}

export const hasActiveFilters = ({ q, type, status }: TransactionFilters) => Boolean(q || type || status)

export type UrlPatch = Partial<TransactionFilters> & { tx?: string | null }

/**
 * Returns the query string (without "?") after applying `patch`. Params we don't manage, such as
 * `__scenario`, are preserved. Changing a filter resets pagination unless a page is given.
 */
export function patchSearchParams(current: URLSearchParams, patch: UrlPatch): string {
  const next = new URLSearchParams(current)
  const resetsPage = 'q' in patch || 'type' in patch || 'status' in patch

  const set = (key: string, value: string | number | null | undefined) => {
    if (value === undefined) return
    if (value === null || value === '' || (key === 'page' && Number(value) <= 1)) next.delete(key)
    else next.set(key, String(value))
  }

  if (resetsPage) next.delete('page')
  set('q', patch.q?.trim())
  set('type', patch.type)
  set('status', patch.status)
  set('page', patch.page)
  set('tx', patch.tx)
  return next.toString()
}
