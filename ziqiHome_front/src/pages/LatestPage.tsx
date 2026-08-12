import { useEffect, useRef, useState } from "react";
import type { SyntheticEvent } from "react";
import { siteClient } from "../api/siteClient";
import type { MomentCategorySummary, MomentSummary } from "../types/content";
import styles from "./LatestPage.module.css";

const allCategoryId = "all";

/**
 * 瞬间页使用统一帖子流承载图文和纯文字内容，保持后端返回的置顶与时间顺序。
 */
export function LatestPage() {
  const [moments, setMoments] = useState<MomentSummary[]>([]);
  const [categories, setCategories] = useState<MomentCategorySummary[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState(allCategoryId);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentCacheRef = useRef(new Map<string, MomentSummary[]>());
  const contentRequestIdRef = useRef(0);

  useEffect(() => {
    void loadMomentCategories();
  }, []);

  useEffect(() => {
    void loadLatestContent(activeCategoryId);
  }, [activeCategoryId]);

  async function loadMomentCategories() {
    try {
      const categoryData = await siteClient.listMomentCategories();
      setCategories(categoryData);
    } catch {
      // 分类失败不阻断全部帖子，页面仍保留“全部”入口。
      setCategories([]);
    }
  }

  async function loadLatestContent(categoryId: string) {
    const requestId = contentRequestIdRef.current + 1;
    const cachedContent = contentCacheRef.current.get(categoryId);
    contentRequestIdRef.current = requestId;

    if (cachedContent) {
      // 已访问分类直接回填缓存，避免重复请求和整页加载闪烁。
      setMoments(cachedContent);
      setError(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const hasVisibleContent = contentCacheRef.current.size > 0;
    setLoading(!hasVisibleContent);
    setRefreshing(hasVisibleContent);
    setError(null);

    try {
      const data = await siteClient.listMoments(
        categoryId === allCategoryId ? undefined : { categoryId },
      );

      // 快速切换分类时只接收最后一次请求，避免旧响应覆盖新结果。
      if (requestId !== contentRequestIdRef.current) {
        return;
      }

      contentCacheRef.current.set(categoryId, data);
      setMoments(data);
    } catch (loadError) {
      if (requestId === contentRequestIdRef.current) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "瞬间内容加载失败，请稍后重试",
        );
      }
    } finally {
      if (requestId === contentRequestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }

  function handleCategoryChange(categoryId: string) {
    if (categoryId !== activeCategoryId) {
      setActiveCategoryId(categoryId);
    }
  }

  // 图片资源失效时隐藏图片自身，保证文字帖子仍保持完整结构。
  function handleMomentImageError(event: SyntheticEvent<HTMLImageElement>) {
    event.currentTarget.hidden = true;
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.headingGroup}>
          <span className={styles.eyebrow}>Moments</span>
          <h1>瞬间</h1>
        </div>

        <div className={styles.categoryFilters} aria-label="瞬间分类筛选">
          <button
            type="button"
            className={`${styles.categoryFilter} ${
              activeCategoryId === allCategoryId
                ? styles.categoryFilterActive
                : ""
            }`}
            aria-pressed={activeCategoryId === allCategoryId}
            onClick={() => handleCategoryChange(allCategoryId)}
          >
            全部
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`${styles.categoryFilter} ${
                activeCategoryId === category.id
                  ? styles.categoryFilterActive
                  : ""
              }`}
              aria-pressed={activeCategoryId === category.id}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.requestStatus} aria-live="polite">
        {refreshing ? "正在更新瞬间内容" : ""}
      </div>

      {loading ? (
        <section className={styles.statePanel}>
          <p>正在加载瞬间内容...</p>
        </section>
      ) : error && moments.length === 0 ? (
        <section className={styles.statePanel}>
          <p>{error}</p>
        </section>
      ) : moments.length === 0 ? (
        <section className={styles.statePanel}>
          <p>这个分类下暂时还没有瞬间。</p>
        </section>
      ) : (
        <>
          {error ? (
            <section className={styles.inlineError} role="status">
              <p>{error}，已保留上一次加载的内容。</p>
            </section>
          ) : null}

          <section
            key={activeCategoryId}
            className={`${styles.momentFeed} ${
              refreshing ? styles.momentFeedRefreshing : ""
            }`}
            aria-label="瞬间帖子流"
            aria-busy={refreshing}
          >
            {moments.map((moment) => (
              <article key={moment.id} className={styles.momentCard}>
                <header className={styles.momentMeta}>
                  <div className={styles.momentLabels}>
                    <span className={styles.categoryLabel}>
                      {moment.categoryName}
                    </span>
                    {moment.pinned ? (
                      <span className={styles.pinnedLabel}>置顶</span>
                    ) : null}
                  </div>

                  <time dateTime={moment.createdAt}>
                    {formatMomentDate(moment.createdAt)}
                  </time>
                </header>

                <p className={styles.momentContent}>{moment.content}</p>

                {moment.imageUrl ? (
                  <img
                    src={moment.imageUrl}
                    alt={moment.imageAlt || `${moment.categoryName} 图片记录`}
                    className={styles.momentImage}
                    loading="lazy"
                    decoding="async"
                    onError={handleMomentImageError}
                  />
                ) : null}
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

/**
 * 公开页统一格式化时间，避免直接暴露后端 ISO 字符串。
 */
function formatMomentDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}
