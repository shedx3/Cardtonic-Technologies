import type { CSSProperties } from 'react'
import { cx } from '@/lib/cx'
import styles from './Skeleton.module.css'

export function Skeleton({
  width,
  height = 12,
  circle,
  className,
}: {
  width?: number | string
  height?: number
  circle?: boolean
  className?: string
}) {
  const style: CSSProperties = { width: circle ? height : (width ?? '100%'), height }
  return <span aria-hidden className={cx(styles.block, circle && styles.circle, className)} style={style} />
}
