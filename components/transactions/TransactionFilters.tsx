import { Button, Input, Select, type SelectOption } from '@/components/ui'
import { TRANSACTION_STATUS_LABELS, TRANSACTION_TYPE_LABELS } from '@/lib/format'
import type { TransactionFilters as Filters } from '@/lib/transactions/url'
import styles from './TransactionFilters.module.css'

// "Reversed" appears in the design, but the API has no such status, so it isn't offered.
const TYPE_OPTIONS: SelectOption[] = [
  { value: '', label: 'All types' },
  ...Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => ({ value, label })),
]

const STATUS_OPTIONS: SelectOption[] = [
  { value: '', label: 'All statuses' },
  ...Object.entries(TRANSACTION_STATUS_LABELS).map(([value, label]) => ({ value, label })),
]

export interface TransactionFiltersProps {
  search: string
  type: Filters['type']
  status: Filters['status']
  showClear: boolean
  onSearchChange: (value: string) => void
  onTypeChange: (value: Filters['type']) => void
  onStatusChange: (value: Filters['status']) => void
  onClear: () => void
}

export function TransactionFilters({
  search,
  type,
  status,
  showClear,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onClear,
}: TransactionFiltersProps) {
  return (
    <div className={styles.bar} role="search">
      <Input
        label="Search"
        type="search"
        leadingIcon="search"
        placeholder="Search by reference, name or narration"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        autoComplete="off"
        fieldClassName={styles.search}
      />
      <Select
        label="Type"
        options={TYPE_OPTIONS}
        value={type}
        onChange={(e) => onTypeChange(e.target.value as Filters['type'])}
        fieldClassName={styles.type}
      />
      <Select
        label="Status"
        options={STATUS_OPTIONS}
        value={status}
        onChange={(e) => onStatusChange(e.target.value as Filters['status'])}
        fieldClassName={styles.status}
      />
      {showClear && (
        <Button variant="ghost" onClick={onClear} className={styles.clear}>
          Clear filters
        </Button>
      )}
    </div>
  )
}
