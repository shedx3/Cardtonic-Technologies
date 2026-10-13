'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import type { Transaction } from '@/types/api'
import { Button, Drawer } from '@/components/ui'
import { ApiError } from '@/lib/api/client'
import { getTransaction, getTransactions } from '@/lib/api/endpoints'
import { useApiQuery } from '@/lib/hooks/useApiQuery'
import {
  hasActiveFilters,
  PAGE_SIZE,
  parseFilters,
  patchSearchParams,
  type UrlPatch,
} from '@/lib/transactions/url'
import { Pagination } from './Pagination'
import { StateMessage } from './StateMessage'
import {
  TransactionDetails,
  TransactionDetailsError,
  TransactionDetailsSkeleton,
  TransactionNotFound,
} from './TransactionDetails'
import { TransactionFilters } from './TransactionFilters'
import { TransactionList } from './TransactionList'
import { TransactionListSkeleton } from './TransactionListSkeleton'
import styles from './TransactionsView.module.css'

const SEARCH_DEBOUNCE_MS = 300

const countLabel = (total: number, filtered: boolean) =>
  filtered
    ? `${total} ${total === 1 ? 'result' : 'results'}`
    : `${total} ${total === 1 ? 'transaction' : 'transactions'}`

/**
 * The Transactions page. Search, filters, page and the open transaction all live in the URL, so
 * refresh, sharing and Back/Forward restore exactly what the user was looking at.
 */
export function TransactionsView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters = parseFilters(searchParams)
  const filtered = hasActiveFilters(filters)
  const selectedId = searchParams.get('tx')

  const navigate = (patch: UrlPatch, mode: 'push' | 'replace' = 'push') => {
    const qs = patchSearchParams(searchParams, patch)
    router[mode](qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }
  // Effects need a stable handle that always sees the latest URL.
  const navigateFromEffect = useEffectEvent(navigate)

  // --- Search box: local text, debounced into the URL -------------------------------------------
  const [search, setSearch] = useState(filters.q)
  const committedQ = useRef(filters.q)

  useEffect(() => {
    // The URL changed from somewhere other than this box (Back/Forward, Clear filters): follow it.
    if (filters.q !== committedQ.current) {
      committedQ.current = filters.q
      setSearch(filters.q)
    }
  }, [filters.q])

  useEffect(() => {
    const q = search.trim()
    if (q === committedQ.current) return
    const timer = setTimeout(() => {
      committedQ.current = q
      // Replace, not push: one history entry per search session rather than one per keystroke.
      navigateFromEffect({ q }, 'replace')
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search])

  // --- List ---------------------------------------------------------------------------------------
  const { q, type, status, page } = filters
  const list = useApiQuery(JSON.stringify([q, type, status, page]), (signal) =>
    getTransactions(
      { q, type: type || undefined, status: status || undefined, page, limit: PAGE_SIZE },
      { signal }
    )
  )
  const rows = list.data?.data ?? []
  const meta = list.data?.meta
  const hasRows = rows.length > 0

  // A shared or stale link can point past the last page; land on the last one instead.
  useEffect(() => {
    if (!list.isLoading && !list.isError && meta && page > meta.totalPages) {
      navigateFromEffect({ page: meta.totalPages }, 'replace')
    }
  }, [list.isLoading, list.isError, meta, page])

  // --- Details ------------------------------------------------------------------------------------
  // Use the row we already have when there is one; only fetch for links opened cold.
  const known = selectedId ? rows.find((tx) => tx.id === selectedId) : undefined
  const detail = useApiQuery<Transaction>(selectedId && !known ? `tx:${selectedId}` : null, (signal) =>
    getTransaction(selectedId!, { signal })
  )
  const selected = known ?? (detail.data?.data.id === selectedId ? detail.data.data : undefined)

  const openedInApp = useRef(false)
  const select = (tx: Transaction) => {
    openedInApp.current = true
    navigate({ tx: tx.id })
  }
  const closeDetails = () => {
    // Opened by a click: undo that history entry. Opened from a link: Back would leave the page.
    if (openedInApp.current) {
      openedInApp.current = false
      router.back()
    } else {
      navigate({ tx: null }, 'replace')
    }
  }

  const clearFilters = () => {
    committedQ.current = ''
    setSearch('')
    navigate({ q: '', type: '', status: '' })
  }

  const goToPage = (next: number) => {
    navigate({ page: next })
    window.scrollTo({ top: 0 })
  }

  // --- Render -------------------------------------------------------------------------------------
  let body
  if (list.isError) {
    body = (
      <StateMessage
        icon="alert"
        tone="danger"
        title="We couldn’t load your transactions"
        description="Check your connection and try again."
        action={
          <Button iconLeft="refresh" onClick={list.retry}>
            Try again
          </Button>
        }
      />
    )
  } else if (!list.data || (list.isLoading && !hasRows) || (!hasRows && meta && page > meta.totalPages)) {
    body = <TransactionListSkeleton />
  } else if (!hasRows) {
    body = filtered ? (
      <StateMessage
        icon="search"
        title="No transactions match your filters"
        description="Try a different search term or remove some filters."
        action={
          <Button variant="secondary" onClick={clearFilters}>
            Clear filters
          </Button>
        }
      />
    ) : (
      <StateMessage
        icon="inbox"
        title="No transactions yet"
        description="When you add money, send a transfer or pay with your card, it will show up here."
      />
    )
  } else {
    body = <TransactionList transactions={rows} onSelect={select} isRefreshing={list.isLoading} />
  }

  let detailBody
  if (selected) detailBody = <TransactionDetails transaction={selected} />
  else if (detail.isError) {
    detailBody =
      detail.error instanceof ApiError && detail.error.status === 404 ? (
        <TransactionNotFound onBack={closeDetails} />
      ) : (
        <TransactionDetailsError onRetry={detail.retry} />
      )
  } else detailBody = <TransactionDetailsSkeleton />

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>Transactions</h1>
        <p className={styles.subtitle} aria-live="polite">
          {meta && !list.isError ? countLabel(meta.total, filtered) : ' '}
        </p>
      </header>

      <TransactionFilters
        search={search}
        type={type}
        status={status}
        showClear={filtered || search.trim() !== ''}
        onSearchChange={setSearch}
        onTypeChange={(value) => navigate({ type: value })}
        onStatusChange={(value) => navigate({ status: value })}
        onClear={clearFilters}
      />

      {body}

      {meta && meta.totalPages > 1 && !list.isError && (
        <Pagination
          page={Math.min(page, meta.totalPages)}
          totalPages={meta.totalPages}
          onPageChange={goToPage}
        />
      )}

      <Drawer open={selectedId !== null} title="Transaction details" onClose={closeDetails}>
        {detailBody}
      </Drawer>
    </div>
  )
}
