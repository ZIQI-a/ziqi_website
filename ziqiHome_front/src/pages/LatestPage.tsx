import { useEffect, useRef, useState } from "react";
import { siteClient } from "../api/siteClient";
import type { MomentCategorySummary, MomentSummary } from "../types/content";
import styles from "./LatestPage.module.css";

const allCategoryId = "all";

type LatestContentCache = {
  featuredMoments: MomentSummary[];
  textMoments: MomentSummary[];
};

/**
 * 最新页以 moments 为中心，既展示纯文字近况，也展示带图记录。
 */
export function LatestPage() {
  const [featuredMoments, setFeaturedMoments] = useState<MomentSummary[]>([]);
  const [textMoments, setTextMoments] = useState<MomentSummary[]>([]);
  const [categories, setCategories] = useState<MomentCategorySummary[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState(allCategoryId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentCacheRef = useRef(new Map<string, LatestContentCache>());
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
      setCategories([]);
    }
  }

  async function loadLatestContent(categoryId: string) {
    const requestId = contentRequestIdRef.current + 1;
    const cachedContent = contentCacheRef.current.get(categoryId);
    contentRequestIdRef.current = requestId;

    if (cachedContent) {
      // 分类内容已请求过时直接回填缓存，切回分类不再触发接口和 loading 替换。
      setFeaturedMoments(cachedContent.featuredMoments);
      setTextMoments(cachedContent.textMoments);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(contentCacheRef.current.size === 0);
    setError(null);

    try {
      const momentQuery =
        categoryId === allCategoryId ? undefined : { categoryId };

      // 图文和纯文字由后端按 hasImage 参数拆开返回，前端只负责展示。
      const [featuredData, textData] = await Promise.all([
        siteClient.listMoments({
          ...momentQuery,
          hasImage: true,
        }),
        siteClient.listMoments({
          ...momentQuery,
          hasImage: false,
        }),
      ]);

      if (requestId !== contentRequestIdRef.current) {
        return;
      }

      contentCacheRef.current.set(categoryId, {
        featuredMoments: featuredData,
        textMoments: textData,
      });
      setFeaturedMoments(featuredData);
      setTextMoments(textData);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "最新内容加载失败，请稍后重试",
      );
    } finally {
      if (requestId === contentRequestIdRef.current) {
        setLoading(false);
      }
    }
  }

  function handleCategoryChange(categoryId: string) {
    if (categoryId === activeCategoryId) {
      return;
    }

    setActiveCategoryId(categoryId);
  }

  const hasMoments = featuredMoments.length + textMoments.length > 0;

  return (
    <div className={styles.page}>
      <section className={styles.heroPanel}>
        <div className={styles.heroCopy}>
          <span className={styles.heroEyebrow}>Moments Feed</span>
          <h2>时间记忆</h2>
        </div>

        <div className={styles.filterBar} aria-label="最新内容分类筛选">
          <button
            type="button"
            className={`${styles.filterChip} ${
              activeCategoryId === allCategoryId ? styles.filterChipActive : ""
            }`}
            onClick={() => handleCategoryChange(allCategoryId)}
          >
            全部
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`${styles.filterChip} ${
                activeCategoryId === category.id ? styles.filterChipActive : ""
              }`}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <section className={styles.statePanel}>
          <p>正在加载最新内容...</p>
        </section>
      ) : error ? (
        <section className={styles.statePanel}>
          <p>{error}</p>
        </section>
      ) : !hasMoments ? (
        <section className={styles.statePanel}>
          <p>哦吼，走丢喽！！！</p>
        </section>
      ) : (
        <>
          <section
            key={`featured-${activeCategoryId}`}
            className={styles.sectionBlock}
          >
            <div className={styles.sectionHeading}>
              <span>且看且珍惜</span>
              <h3>生活切片</h3>
            </div>

            {featuredMoments.length === 0 ? (
              <div className={styles.emptyPanel}>
                <p>这个分类下暂时没有图文内容。</p>
              </div>
            ) : (
              <div className={styles.gallery}>
                {featuredMoments.map((moment, index) => (
                  <article
                    key={moment.id}
                    className={`${styles.galleryCard} ${
                      index === 0 ? styles.galleryCardFeatured : ""
                    }`}
                  >
                    <img
                      src={moment.imageUrl}
                      alt={moment.imageAlt || `${moment.categoryName} 图片记录`}
                    />
                    <div className={styles.galleryOverlay} />
                    <div className={styles.galleryMeta}>
                      <span>{moment.categoryName}</span>
                      <h4>{formatMomentDate(moment.createdAt)}</h4>
                      <p>{moment.content}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section
            key={`text-${activeCategoryId}`}
            className={styles.sectionBlock}
          >
            <div className={styles.sectionHeading}>
              <span>enenen</span>
              <h3>随笔</h3>
            </div>

            {textMoments.length === 0 ? (
              <div className={styles.emptyPanel}>
                <p>这个分类下暂时没有文字动态。</p>
              </div>
            ) : (
              <div className={styles.updates}>
                {textMoments.map((moment) => (
                  <article key={moment.id} className={styles.updateCard}>
                    <div className={styles.updateTop}>
                      <span>{moment.categoryName}</span>
                      <time dateTime={moment.createdAt}>
                        {formatMomentDate(moment.createdAt)}
                      </time>
                    </div>
                    <p>{moment.content}</p>
                  </article>
                ))}
              </div>
            )}
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
