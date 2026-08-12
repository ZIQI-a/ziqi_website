import { useEffect, useState, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import { siteClient } from "../api/siteClient";
import { profileInfo } from "../data/siteContent";
import { HeroSection } from "../components/HeroSection";
import { ProfileCards } from "../components/ProfileCards";
import type { MomentSummary } from "../types/content";
import styles from "./HomePage.module.css";

const homeSections = [
  { id: "home-hero", label: "主页" },
  { id: "home-about", label: "关于我" },
  { id: "home-life", label: "生活" },
  { id: "home-latest", label: "瞬间" },
];
const homeStateSections = homeSections.filter(
  (section) => section.id !== "home-latest",
);
const homeImageMomentLimit = 3;
const homeTextMomentLimit = 2;

export function HomePage() {
  const [activeSection, setActiveSection] = useState(homeSections[0].id);
  const [lifeMoments, setLifeMoments] = useState<MomentSummary[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<MomentSummary[]>([]);
  const [loadingMoments, setLoadingMoments] = useState(true);
  const [momentError, setMomentError] = useState<string | null>(null);
  const hasMomentContent =
    lifeMoments.length > 0 || recentUpdates.length > 0;
  const showSplitMomentSections =
    !loadingMoments && !momentError && hasMomentContent;
  const visibleHomeSections = showSplitMomentSections
    ? homeSections
    : homeStateSections;
  const isHeroActive = activeSection === "home-hero";

  // 通过视口中心线判断当前分区，让侧边导航高亮与阅读位置保持一致。
  useEffect(() => {
    const trackedSections = showSplitMomentSections
      ? homeSections
      : homeStateSections;

    const updateActiveSection = () => {
      const viewportCenterY = window.innerHeight * 0.46;
      let matchedSectionId = trackedSections[0].id;
      let minDistance = Number.POSITIVE_INFINITY;

      trackedSections.forEach((section) => {
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
  }, [showSplitMomentSections]);

  // 首页仅消费后台精选结果，再按内容形态限制首屏展示数量。
  useEffect(() => {
    let ignoreResult = false;

    async function loadHomeMoments() {
      setLoadingMoments(true);
      setMomentError(null);

      try {
        const moments = await siteClient.listMoments({ showOnHome: true });

        if (ignoreResult) {
          return;
        }

        setLifeMoments(
          moments
            .filter((moment) => Boolean(moment.imageUrl))
            .slice(0, homeImageMomentLimit),
        );
        setRecentUpdates(
          moments
            .filter((moment) => !moment.imageUrl)
            .slice(0, homeTextMomentLimit),
        );
      } catch (loadError) {
        if (ignoreResult) {
          return;
        }

        setMomentError(
          loadError instanceof Error
            ? loadError.message
            : "首页精选瞬间加载失败，请稍后再来看看",
        );
      } finally {
        if (!ignoreResult) {
          setLoadingMoments(false);
        }
      }
    }

    void loadHomeMoments();

    return () => {
      ignoreResult = true;
    };
  }, []);

  return (
    <div className={styles.page}>
      <nav
        className={`${styles.sideNav} ${
          isHeroActive ? styles.sideNavHidden : styles.sideNavVisible
        }`}
        aria-label="主页分区导航"
        aria-hidden={isHeroActive}
      >
        {visibleHomeSections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={`${styles.sideNavLink} ${
              activeSection === section.id ? styles.sideNavLinkActive : ""
            }`}
            aria-label={section.label}
            tabIndex={isHeroActive ? -1 : undefined}
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

      {!showSplitMomentSections ? (
        <section
          id="home-life"
          className={`${styles.sectionWrap} ${styles.momentsStateSection}`}
        >
          <article className={styles.momentsStateCard}>
            {!momentError ? <span>MOMENTS</span> : null}
            <p>
              {loadingMoments
                ? "正在整理首页精选..."
                : momentError || "暂时还没有展示到首页的精选瞬间。"}
            </p>
          </article>
        </section>
      ) : (
        <>
          <section id="home-life" className={styles.sectionWrap}>
            <div className={styles.sectionTitleWrap}>
              <h2 className={styles.sectionTitle}>生活明朗，万物可爱</h2>
              <p className={styles.sectionDesc}>
                年少时曾说，遇见你，就像跋山涉水遇见一轮月亮
              </p>
            </div>

            <div className={styles.lifeGrid}>
              {lifeMoments.length === 0 ? (
                <article className={styles.lifeStateCard}>
                  <p>精选里暂时没有图文记录。</p>
                </article>
              ) : (
                lifeMoments.map((moment) => (
                  <article key={moment.id} className={styles.lifeCard}>
                    <img
                      src={moment.imageUrl}
                      alt={
                        moment.imageAlt || `${moment.categoryName} 图片记录`
                      }
                      loading="lazy"
                      decoding="async"
                      onError={handleMomentImageError}
                    />
                    <div className={styles.lifeOverlay} />
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
              {recentUpdates.length === 0 ? (
                <article
                  className={`${styles.latestCard} ${styles.latestStateCard}`}
                >
                  <span>暂无文字精选</span>
                  <p>偶尔空白，也算生活留给下一句话的位置。</p>
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

            <div className={styles.latestMore}>
              <Link to="/latest" className={styles.latestMoreLink}>
                查看全部瞬间
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

/** 图片资源不可用时隐藏损坏图标，并保留卡片渐变背景和文字信息。 */
function handleMomentImageError(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.hidden = true;
}

/** 首页和瞬间页统一日期文案，保证公开区的时间表现一致。 */
function formatMomentDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}
