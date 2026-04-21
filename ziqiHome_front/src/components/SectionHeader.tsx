import styles from './SectionHeader.module.css'

interface SectionHeaderProps {
  eyebrow: string
  title: string
  description: string
}

/**
 * 统一的分区标题组件，避免每个区域重复写标题结构。
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <header className={styles.header}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
    </header>
  )
}
