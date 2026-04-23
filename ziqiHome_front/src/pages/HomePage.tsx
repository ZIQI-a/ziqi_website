import { useEffect, useState } from "react";
import { siteClient } from "../api/siteClient";
import { profileInfo } from "../data/siteContent";
import { HeroSection } from "../components/HeroSection";
import { ProfileCards } from "../components/ProfileCards";
import type { MomentCategorySummary, MomentSummary } from "../types/content";
import styles from "./HomePage.module.css";

const homeSections = [
  { id: "home-hero", label: "主页" },
  { id: "home-about", label: "关于我" },
  { id: "home-life", label: "生活" },
  { id: "home-latest", label: "瞬间" },
];

export function HomePage() {
  const [activeSection, setActiveSection] = useState(homeSections[0].id);
  const [moments, setMoments] = useState<MomentSummary[]>([]);
  const [categories, setCategories] = useState<MomentCategorySummary[]>([]);
  const [activeCategoryName, setActiveCategoryName] = useState("全部");
  const [loadingMoments, setLoadingMoments] = useState(true);
  const [momentError, setMomentError] = useState<string | null>(null);
  const isHeroActive = activeSection === "home-hero";
  // 滚动监听和当前 section 高亮
  useEffect(() => {
    // 用视口中心线命中 section，而不是按可见面积排序。
    const updateActiveSection = () => {
      const viewportCenterY = window.innerHeight * 0.46;

      let matchedSectionId = homeSections[0].id;
      let minDistance = Number.POSITIVE_INFINITY;

      homeSections.forEach((section) => {
        const element = document.getElementById(section.id);

        if (!element) {
          return;
        }

        const rect = element.getBoundingClientRect();
        const isCenterInsideSection =
          rect.top <= viewportCenterY && rect.bottom >= viewportCenterY;

        if (isCenterInsideSection) {
          matchedSectionId = section.id;
          minDistance = 0;
          return;
        }

        if (minDistance === 0) {
          return;
        }

        const sectionCenterY = rect.top + rect.height / 2;
        const distanceToViewportCenter = Math.abs(
          sectionCenterY - viewportCenterY,
        );

        if (distanceToViewportCenter < minDistance) {
          minDistance = distanceToViewportCenter;
          matchedSectionId = section.id;
        }
      });

      setActiveSection(matchedSectionId);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);
  // 请求首页 moments 数据
  useEffect(() => {
    void loadHomeMoments();
  }, []);

  async function loadHomeMoments() {
    setLoadingMoments(true);
    setMomentError(null);

    try {
      // 首页第三、第四屏共用同一批公开 moments，再按图片与文本分区。
      const [momentData, categoryData] = await Promise.all([
        siteClient.listMoments(),
        siteClient.listMomentCategories(),
      ]);

      setMoments(momentData);
      setCategories(categoryData);
    } catch (loadError) {
      setMomentError(
        loadError instanceof Error
          ? loadError.message
          : "首页 moments 加载失败，请稍后重试",
      );
    } finally {
      setLoadingMoments(false);
    }
  }

  const homeMoments = moments.filter((moment) => moment.showOnHome);
  const filteredHomeMoments = homeMoments.filter((moment) => {
    if (activeCategoryName === "全部") {
      return true;
    }

    return moment.categoryName === activeCategoryName;
  });
  const lifeMoments = filteredHomeMoments.filter((moment) =>
    Boolean(moment.imageUrl),
  );
  const recentUpdates = filteredHomeMoments.filter(
    (moment) => !moment.imageUrl,
  );

  return (
    <div className={styles.page}>
      <nav
        className={`${styles.sideNav} ${
          isHeroActive ? styles.sideNavExpanded : styles.sideNavCompact
        }`}
        aria-label="主页分区导航"
      >
        {homeSections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={`${styles.sideNavLink} ${
              activeSection === section.id ? styles.sideNavLinkActive : ""
            }`}
            aria-label={section.label}
            onClick={() => setActiveSection(section.id)}
          >
            <span className={styles.sideNavDot} aria-hidden="true" />
            <span className={styles.sideNavLabel}>{section.label}</span>
          </a>
        ))}
      </nav>

      <section id="home-hero" className={styles.heroSection}>
        <HeroSection profile={profileInfo} />
      </section>

      <section id="home-about" className={styles.sectionWrap}>
        <ProfileCards profile={profileInfo} />
      </section>

      <section id="home-life" className={styles.sectionWrap}>
        <div className={styles.sectionTitleWrap}>
          <h2 className={styles.sectionTitle}>生活明朗，万物可爱</h2>
          <p className={styles.sectionDesc}>
            年少时曾说，遇见你，就像跋山涉水遇见一轮月亮
          </p>
          <div className={styles.lifeTabs}>
            <button
              type="button"
              className={`${styles.lifeTabButton} ${
                activeCategoryName === "全部" ? styles.lifeTabActive : ""
              }`}
              onClick={() => setActiveCategoryName("全部")}
            >
              全部
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`${styles.lifeTabButton} ${
                  activeCategoryName === category.name
                    ? styles.lifeTabActive
                    : ""
                }`}
                onClick={() => setActiveCategoryName(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.lifeGrid}>
          {loadingMoments ? (
            <article className={styles.lifeStateCard}>
              <p>正在整理生活记录...</p>
            </article>
          ) : momentError ? (
            <article className={styles.lifeStateCard}>
              <p>{momentError}</p>
            </article>
          ) : lifeMoments.length === 0 ? (
            <article className={styles.lifeStateCard}>
              <p>这个分类下暂时没有记录~</p>
            </article>
          ) : (
            lifeMoments.map((moment) => (
              <article key={moment.id} className={styles.lifeCard}>
                <img
                  src={moment.imageUrl}
                  alt={moment.imageAlt || `${moment.categoryName} 图片记录`}
                />
                <div className={styles.lifeOverlay} />
                <span className={styles.lifeArrow}>↗</span>
                <div className={styles.lifeMeta}>
                  <p>{formatMomentDate(moment.createdAt)}</p>
                  <h3>{moment.categoryName}</h3>
                  <span>{moment.content}</span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section id="home-latest" className={styles.sectionWrap}>
        <div className={styles.sectionTitleWrap}>
          <h2 className={styles.sectionTitle}>人间值得，未来可期</h2>
          <p className={styles.sectionDesc}>
            我从前一天来，要找的人是你，你往后一天去，不是我要找的人了
          </p>
        </div>

        <div className={styles.latestGrid}>
          {loadingMoments ? (
            <article className={styles.latestCard}>
              <span>加载中</span>
              <p>正在同步文字动态...</p>
            </article>
          ) : momentError ? (
            <article className={styles.latestCard}>
              <span>读取失败</span>
              <p>{momentError}</p>
            </article>
          ) : recentUpdates.length === 0 ? (
            <article className={styles.latestCard}>
              <span>暂无内容</span>
              <p>当前没有需要展示到首页的文字动态。</p>
            </article>
          ) : (
            recentUpdates.map((moment) => (
              <article key={moment.id} className={styles.latestCard}>
                <div className={styles.latestCardTop}>
                  <span>{moment.categoryName}</span>
                  <time dateTime={moment.createdAt}>
                    {formatMomentDate(moment.createdAt)}
                  </time>
                </div>
                <p>{moment.content}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

/**
 * 首页和最新页统一日期文案，保证公开区的时间表现一致。
 */
function formatMomentDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}
