import { Button } from '@/components/ui'
import styles from './Pagination.module.css'

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <Button
        variant="secondary"
        size="sm"
        iconLeft="chevron-left"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </Button>
      <span className={styles.status} aria-live="polite">
        Page {page} of {totalPages}
      </span>
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
  )
}
