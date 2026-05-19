import { Link } from 'react-router-dom'
import type { BlogPostSummary } from '../types/content'
import styles from './BlogCard.module.css'

interface BlogCardProps {
  post: BlogPostSummary
}

export function BlogCard({ post }: BlogCardProps) {
  const titleNode = post.contentMode === 'EXTERNAL' && post.sourceUrl ? (
    <a href={post.sourceUrl} target="_blank" rel="noreferrer">
      {post.title}
    </a>
  ) : (
    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
  )

  return (
    <article className={styles.card}>
      <img className={styles.cover} src={post.cover} alt={post.title} />
      <div className={styles.content}>
        <p className={styles.meta}>
          <span>{post.category}</span>
          <span>{post.date}</span>
        </p>
        <h3>{titleNode}</h3>
        <p className={styles.summary}>{post.summary}</p>
        <div className={styles.tags}>
          {post.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        {post.sourceLabel || post.contentMode === 'EXTERNAL' ? (
          <p className={styles.meta}>
            <span>{post.sourceLabel ?? '外部文章'}</span>
          </p>
        ) : null}
      </div>
    </article>
  )
}
