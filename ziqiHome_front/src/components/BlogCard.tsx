import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import type { BlogPostSummary } from "../types/content";
import {
  getBlogSummaryPresentation,
  getBlogVisualIdentity,
  isDefaultBlogCover,
} from "../utils/blogPresentation";
import styles from "./BlogCard.module.css";

interface BlogCardProps {
  post: BlogPostSummary;
  onTagClick?: (tag: string) => void;
  variant?: "featured" | "compact" | "standard";
  repeatedCover?: boolean;
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
  repeatedCover = false,
}: BlogCardProps) {
  const [coverFailed, setCoverFailed] = useState(false);
  const isExternal = post.contentMode === "EXTERNAL" && post.sourceUrl;
  const summary = getBlogSummaryPresentation(post.summary);
  const identity = getBlogVisualIdentity(post);
  const showCoverIdentity =
    coverFailed || repeatedCover || isDefaultBlogCover(post.cover);
  const coverStyle = {
    "--blog-cover-fallback": identity.gradient,
  } as CSSProperties;

  // 覆盖式链接提供整卡点击区域，标签按钮保持为独立交互，避免按钮嵌套链接。
  const cardLink = isExternal ? (
    <a
      href={post.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
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
      <div className={styles.coverFrame} style={coverStyle}>
        {!coverFailed ? (
          <img
            className={styles.cover}
            src={post.cover}
            alt=""
            loading={variant === "featured" ? "eager" : "lazy"}
            decoding="async"
            onError={() => setCoverFailed(true)}
          />
        ) : (
          <div className={styles.coverFallback} aria-hidden="true">
            <span>Blog archive</span>
            <strong>{identity.code}</strong>
            <small>{post.category}</small>
          </div>
        )}

        {showCoverIdentity && !coverFailed ? (
          <span className={styles.coverIdentity} aria-hidden="true">
            <small>{post.category}</small>
            {identity.code}
          </span>
        ) : null}
      </div>

      <div className={styles.content} data-article-code={identity.code}>
        <p className={styles.meta}>
          <span>{post.category}</span>
          <time dateTime={post.date}>{post.date}</time>
        </p>
        <h3>{post.title}</h3>
        <p
          className={`${styles.summary} ${
            summary.isFallback ? styles.summaryFallback : ""
          }`}
        >
          {summary.text}
        </p>

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
