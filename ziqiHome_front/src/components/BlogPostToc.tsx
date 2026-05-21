import { useEffect, useRef, useState } from "react";
import styles from "./BlogPostToc.module.css";

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

interface BlogPostTocProps {
  headings: TocHeading[];
}

/**
 * 侧边文章目录，固定浮动在文章右侧，用 IntersectionObserver 高亮当前阅读位置。
 */
export function BlogPostToc({ headings }: BlogPostTocProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // 清理旧的 observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (headings.length === 0) {
      return;
    }

    const headingElements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    // 根边距：顶部留 100px 作为判断线，一旦标题顶部进入该区域就视为活跃
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // 收集所有当前相交的标题，取最靠上的那个为活跃标题
        const intersecting = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (intersecting.length > 0) {
          setActiveId(intersecting[0].target.id);
        }
      },
      { rootMargin: "-100px 0px -70% 0px" },
    );

    headingElements.forEach((el) => observerRef.current!.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className={styles.toc} aria-label="文章目录">
      <span className={styles.tocTitle}>目录</span>
      <ul className={styles.tocList}>
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={`${styles.tocItem} ${styles[`tocLevel${heading.level}`]}`}
          >
            <a
              href={`#${heading.id}`}
              className={`${styles.tocLink} ${
                activeId === heading.id ? styles.tocLinkActive : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(heading.id)
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
