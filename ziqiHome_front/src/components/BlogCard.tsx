import { Link } from "react-router-dom";
import type { BlogPostSummary } from "../types/content";
import styles from "./BlogCard.module.css";

interface BlogCardProps {
  post: BlogPostSummary;
  onTagClick?: (tag: string) => void;
  variant?: "featured" | "compact" | "standard";
}

const variantClasses = {
  featured: styles.featured,
  compact: styles.compact,
  standard: styles.standard,
};

export function BlogCard({
  post,
  onTagClick,
  variant = "standard",
}: BlogCardProps) {
  const isExternal = post.contentMode === "EXTERNAL" && post.sourceUrl;

  // 覆盖式链接提供整卡点击区域，标签按钮保持为独立交互，避免按钮嵌套链接。
  const cardLink = isExternal ? (
    <a
      href={post.sourceUrl}
      target="_blank"
      rel="noreferrer"
      className={styles.cardLink}
      aria-label={`阅读文章：${post.title}`}
    />
  ) : (
    <Link
      to={`/blog/${post.slug}`}
      className={styles.cardLink}
      aria-label={`阅读文章：${post.title}`}
    />
  );

  return (
    <article className={`${styles.card} ${variantClasses[variant]}`}>
      <img
        className={styles.cover}
        src={post.cover}
        alt={post.title}
        loading={variant === "featured" ? "eager" : "lazy"}
      />

      <div className={styles.content}>
        <p className={styles.meta}>
          <span>{post.category}</span>
          <time dateTime={post.date}>{post.date}</time>
        </p>
        <h3>{post.title}</h3>
        <p className={styles.summary}>{post.summary}</p>

        <div className={styles.tags}>
          {post.tags.map((tag) =>
            onTagClick ? (
              <button
                key={tag}
                type="button"
                className={styles.tagButton}
                onClick={() => onTagClick(tag)}
              >
                {tag}
              </button>
            ) : (
              <span key={tag}>{tag}</span>
            ),
          )}
        </div>

        <div className={styles.cardFooter}>
          <span className={styles.readMore}>
            {isExternal ? "阅读原文 ↗" : "阅读全文 →"}
          </span>
          {post.sourceLabel || isExternal ? (
            <span className={styles.sourceLabel}>
              {post.sourceLabel ?? "外部文章"}
            </span>
          ) : null}
        </div>
      </div>

      {cardLink}
    </article>
  );
}
