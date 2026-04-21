import type { ReactNode } from 'react'
import { Space, Typography } from 'antd'
import styles from './AdminPageHeader.module.css'

interface AdminPageHeaderProps {
  eyebrow: string
  title: string
  actions?: ReactNode
}

/**
 * 管理页标题区保持统一结构，避免每个 CRUD 页面重复写同样的标题和操作栏。
 */
export function AdminPageHeader({
  eyebrow,
  title,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className={styles.sectionHeader}>
      <div>
        <Typography.Text className={styles.eyebrow}>{eyebrow}</Typography.Text>
        <Typography.Title level={2} className={styles.title}>
          {title}
        </Typography.Title>
      </div>

      {actions ? <Space wrap>{actions}</Space> : null}
    </div>
  )
}
