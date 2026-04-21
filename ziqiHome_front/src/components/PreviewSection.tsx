import { Link } from 'react-router-dom'
import { SectionHeader } from './SectionHeader'
import styles from './PreviewSection.module.css'

interface PreviewSectionProps {
  eyebrow: string
  title: string
  description: string
  moreTo: string
  moreLabel: string
  children: React.ReactNode
}

export function PreviewSection({
  eyebrow,
  title,
  description,
  moreTo,
  moreLabel,
  children,
}: PreviewSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.topRow}>
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <Link className={styles.more} to={moreTo}>
          {moreLabel}
        </Link>
      </div>

      {children}
    </section>
  )
}
