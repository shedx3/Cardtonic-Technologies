import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import styles from './Field.module.css'

export interface FieldProps {
  label: string
  /** The id of the control, so the label is programmatically associated with it. */
  htmlFor?: string
  /** Id applied to the hint/error text, for `aria-describedby` on the control. */
  messageId?: string
  hint?: ReactNode
  error?: string
  /** Visually hide the label (it is still rendered). */
  hideLabel?: boolean
  className?: string
  children: ReactNode
}

/** Label + control + hint/error. Used by Input and Select. */
export function Field({
  label,
  htmlFor,
  messageId,
  hint,
  error,
  hideLabel,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={htmlFor} className={cx(styles.label, hideLabel && 'visually-hidden')}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={messageId} className={styles.error}>
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
