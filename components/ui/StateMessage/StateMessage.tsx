import type { ReactNode } from 'react'
import { Card } from '../Card'
import { Icon, type IconName } from '../Icon'
import { cx } from '@/lib/cx'
import styles from './StateMessage.module.css'

export interface StateMessageProps {
  icon: IconName
  tone?: 'primary' | 'danger'
  title: string
  description: string
  action?: ReactNode
  /** Render without the surrounding card, e.g. inside the details drawer. */
  bare?: boolean
}

/** Centered icon, title, text and optional action: the empty, no-results, error and not-found states. */
export function StateMessage({
  icon,
  tone = 'primary',
  title,
  description,
  action,
  bare,
}: StateMessageProps) {
  const content = (
    <div className={styles.message}>
      <span className={cx(styles.icon, styles[tone])}>
        <Icon name={icon} size={20} />
      </span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      {action}
    </div>
  )
  return bare ? content : <Card padding="none">{content}</Card>
}
