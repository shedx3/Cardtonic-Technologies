'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useEffectEvent, useRef, useState } from 'react'
import type { Transaction } from '@/types/api'
import { Button, Drawer, StateMessage } from '@/components/ui'
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
import {
  Pagination,
  TransactionDetails,
  TransactionDetailsError,
  TransactionDetailsSkeleton,
  TransactionFilters,
  TransactionList,
  TransactionListSkeleton,
  TransactionNotFound,
} from '@/components/transactions'
import styles from './page.module.css'

const SEARCH_DEBOUNCE_MS = 300

const countLabel = (total: number, filtered: boolean) =>
  filtered
    ? `${total} ${total === 1 ? 'result' : 'results'}`
    : `${total} ${total === 1 ? 'transaction' : 'transactions'}`

const noop = () => {}

function PageHeader({ count }: { count?: string }) {
  return (
    <header>
      <h1 className={styles.title}>Transactions</h1>
      <p className={styles.subtitle} aria-live="polite">
        {count ?? ' '}
      </p>
    </header>
  )
}

/** What renders before the client has read the URL: same header and filter bar, inert, over a loading list. */
function TransactionsFallback() {
  return (
    <div className={styles.page}>
      <PageHeader />
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

// useSearchParams needs a Suspense boundary; the fallback is what shows before hydration.
export default function TransactionsPage() {
  return (
    <Suspense fallback={<TransactionsFallback />}>
      <Transactions />
    </Suspense>
  )
}

/**
 * Search, filters, page and the open transaction all live in the URL, so refresh, sharing and
 * Back/Forward restore exactly what the user was looking at.
 */
function Transactions() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters = parseFilters(searchParams)
  const filtered = hasActiveFilters(filters)
  const selectedId = searchParams.get('tx')

  const navigate = (patch: UrlPatch, mode: 'push' | 'replace' = 'push') => {
    const qs = patchSearchParams(searchParams, patch)
    // Native history calls update useSearchParams immediately. router.push would wait for the
    // server round trip first, so the drawer and loading states would appear late.
    const url = qs ? `${pathname}?${qs}` : pathname
    if (mode === 'push') window.history.pushState(null, '', url)
    else window.history.replaceState(null, '', url)
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
  // The drawer opens straight away and shows a skeleton while the full transaction loads.
  const detail = useApiQuery<Transaction>(selectedId ? `tx:${selectedId}` : null, (signal) =>
    getTransaction(selectedId!, { signal })
  )
  const selected = detail.data?.data.id === selectedId ? detail.data.data : undefined

  const openedInApp = useRef(false)
  const select = (tx: Transaction) => {
    openedInApp.current = true
    navigate({ tx: tx.id })
  }
  const closeDetails = () => {
    // Opened by a click: undo that history entry. Opened from a link: Back would leave the page.
    if (openedInApp.current) {
      openedInApp.current = false
      window.history.back()
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
  } else if (!list.data || list.isLoading || (!hasRows && meta && page > meta.totalPages)) {
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
    body = <TransactionList transactions={rows} onSelect={select} />
  }

  let detailBody
  if (detail.isLoading) detailBody = <TransactionDetailsSkeleton />
  else if (selected) detailBody = <TransactionDetails transaction={selected} />
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
          total={meta.total}
          pageSize={PAGE_SIZE}
          onPageChange={goToPage}
        />
      )}

      <Drawer open={selectedId !== null} title="Transaction details" onClose={closeDetails}>
        {detailBody}
      </Drawer>
    </div>
  )
}
