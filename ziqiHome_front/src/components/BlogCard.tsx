import { Link } from "react-router-dom";
import type { BlogPostSummary } from "../types/content";
import styles from "./BlogCard.module.css";

interface BlogCardProps {
  post: BlogPostSummary;
  onTagClick?: (tag: string) => void;
}

export function BlogCard({ post, onTagClick }: BlogCardProps) {
  const cardBody = (
    <>
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
            <button
              key={tag}
              type="button"
              className={styles.tagButton}
              onClick={(e) => {
                e.preventDefault();
                onTagClick?.(tag);
              }}
            >
              {tag}
            </button>
          ))}
        </div>
        {post.sourceLabel || post.contentMode === "EXTERNAL" ? (
          <p className={styles.meta}>
            <span>{post.sourceLabel ?? "外部文章"}</span>
          </p>
        ) : null}
      </div>
    </>
  );

  /**
   * 博客列表统一改为整卡可点击，避免只有标题可点击导致命中区域过小。
   */
  if (post.contentMode === "EXTERNAL" && post.sourceUrl) {
    return (
      <article className={styles.card}>
        <a
          href={post.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className={styles.cardLink}
        >
          {cardBody}
        </a>
      </article>
    );
  }

  return (
    <article className={styles.card}>
      <Link to={`/blog/${post.slug}`} className={styles.cardLink}>
        {cardBody}
      </Link>
    </article>
  );
}
