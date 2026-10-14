import { Card, Skeleton } from '@/components/ui'
import styles from './TransactionList.module.css'

export function TransactionListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Card padding="none" aria-label="Loading transactions" aria-busy="true">
      <div role="status" className="visually-hidden">
        Loading transactions…
      </div>
      <div className={styles.heading}>
        <Skeleton width={48} height={10} />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={styles.skeletonRow}>
          <Skeleton circle height={40} />
          <div className={styles.skeletonMain}>
            <Skeleton width="45%" height={12} />
            <Skeleton width="70%" height={10} />
          </div>
          <div className={styles.skeletonEnd}>
            <Skeleton width={72} height={12} />
            <Skeleton width={48} height={10} />
          </div>
        </div>
      ))}
    </Card>
  )
}
