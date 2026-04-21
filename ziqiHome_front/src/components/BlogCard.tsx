import type { BlogPostSummary } from '../types/content'
import styles from './BlogCard.module.css'

interface BlogCardProps {
  post: BlogPostSummary
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className={styles.card}>
      <img className={styles.cover} src={post.cover} alt={post.title} />
      <div className={styles.content}>
        <p className={styles.meta}>
          <span>{post.category}</span>
          <span>{post.date}</span>
        </p>
        <h3>{post.title}</h3>
        <p className={styles.summary}>{post.summary}</p>
        <div className={styles.tags}>
          {post.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </article>
  )
}
