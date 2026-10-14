import { Button } from '@/components/ui'
import { cx } from '@/lib/cx'
import styles from './Pagination.module.css'

export interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

/** Page numbers to show: first, last, and a window around the current page, with gaps as null. */
export function getPageItems(page: number, totalPages: number): (number | null)[] {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const items: (number | null)[] = [1]
  let start = Math.max(2, page - 1)
  let end = Math.min(totalPages - 1, page + 1)
  if (page <= 2) end = 3
  if (page >= totalPages - 1) start = totalPages - 2
  if (start > 2) items.push(null)
  for (let p = start; p <= end; p++) items.push(p)
  if (end < totalPages - 1) items.push(null)
  items.push(totalPages)
  return items
}

export function Pagination({ page, totalPages, total, pageSize, onPageChange }: PaginationProps) {
  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <div className={styles.wrapper}>
      <p className={styles.summary} aria-live="polite">
        Showing {first}–{last} of {total}
      </p>
      <nav className={styles.pagination} aria-label="Pagination">
        <Button
          variant="secondary"
          size="sm"
          iconLeft="chevron-left"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <span className={styles.longLabel}>Previous</span>
          <span className={styles.shortLabel}>Prev</span>
        </Button>
        <span className={styles.mobileStatus}>
          Page {page} of {totalPages}
        </span>
        <ul className={styles.pages}>
          {getPageItems(page, totalPages).map((item, i) =>
            item === null ? (
              <li key={`gap-${i}`} className={styles.gap} aria-hidden>
                …
              </li>
            ) : (
              <li key={item}>
                <button
                  type="button"
                  className={cx(styles.page, item === page && styles.current)}
                  aria-label={`Page ${item}`}
                  aria-current={item === page ? 'page' : undefined}
                  onClick={() => item !== page && onPageChange(item)}
                >
                  {item}
                </button>
              </li>
            )
          )}
        </ul>
        <Button
          variant="secondary"
          size="sm"
          iconRight="chevron-right"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </nav>
    </div>
  )
}
