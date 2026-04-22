import { useEffect, useState } from "react";
import { siteClient } from "../api/siteClient";
import type { MomentCategorySummary, MomentSummary } from "../types/content";
import styles from "./LatestPage.module.css";

const allCategoryId = "all";

/**
 * 最新页以 moments 为中心，既展示纯文字近况，也展示带图记录。
 */
export function LatestPage() {
  const [moments, setMoments] = useState<MomentSummary[]>([]);
  const [categories, setCategories] = useState<MomentCategorySummary[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState(allCategoryId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadLatestContent();
  }, []);

  async function loadLatestContent() {
    setLoading(true);
    setError(null);

    try {
      // 最新页需要同时拿到内容和分类，保证筛选项与展示数据一致。
      const [momentData, categoryData] = await Promise.all([
        siteClient.listMoments(),
        siteClient.listMomentCategories(),
      ]);

      setMoments(momentData);
      setCategories(categoryData);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "最新内容加载失败，请稍后重试",
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredMoments = moments.filter((moment) => {
    if (activeCategoryId === allCategoryId) {
      return true;
    }

    return moment.categoryId === activeCategoryId;
  });

  const featuredMoments = filteredMoments.filter((moment) =>
    Boolean(moment.imageUrl),
  );
  const textMoments = filteredMoments.filter((moment) => !moment.imageUrl);

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
            onClick={() => setActiveCategoryId(allCategoryId)}
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
              onClick={() => setActiveCategoryId(category.id)}
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
      ) : filteredMoments.length === 0 ? (
        <section className={styles.statePanel}>
          <p>哦吼，走丢喽！！！</p>
        </section>
      ) : (
        <>
          <section className={styles.sectionBlock}>
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

          <section className={styles.sectionBlock}>
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
