import { useEffect, useState, type SyntheticEvent } from "react";
import { siteClient } from "../api/siteClient";
import type { ContactLinkSummary } from "../types/content";
import styles from "./ContactPage.module.css";

export function ContactPage() {
  const [contactLinks, setContactLinks] = useState<ContactLinkSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadContactLinks();
  }, []);

  async function loadContactLinks() {
    setLoading(true);
    setError(null);

    try {
      const data = await siteClient.listContactLinks();
      setContactLinks(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "联系方式加载失败，请稍后重试",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <span className={styles.eyebrow}>Contact Directory</span>
        <h1>找我鸭</h1>
      </header>

      {loading ? (
        <section className={styles.statePanel} aria-live="polite">
          <p>正在加载联系平台...</p>
        </section>
      ) : error ? (
        <section className={styles.statePanel} role="status">
          <p>{error}</p>
        </section>
      ) : contactLinks.length === 0 ? (
        <section className={styles.statePanel}>
          <p>当前还没有已公开的联系平台。</p>
        </section>
      ) : (
        <section className={styles.grid} aria-label="公开联系平台">
          {contactLinks.map((contactLink) => (
            <a
              key={contactLink.id}
              href={contactLink.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.card}
              aria-label={`访问 ${contactLink.platformName}`}
            >
              <div className={styles.iconWrap} aria-hidden="true">
                <span className={styles.iconFallback}>
                  {getPlatformInitial(contactLink.platformName)}
                </span>
                <img
                  src={contactLink.iconUrl}
                  alt=""
                  className={styles.icon}
                  loading="lazy"
                  decoding="async"
                  onError={handlePlatformIconError}
                />
              </div>

              <div className={styles.cardContent}>
                <h2>{contactLink.platformName}</h2>
                <p>{contactLink.description}</p>
              </div>

              <span className={styles.cardArrow} aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </span>
            </a>
          ))}
        </section>
      )}
    </div>
  );
}

/** 为失效或暂未加载的平台图标提供稳定的单字符回退。 */
function getPlatformInitial(platformName: string) {
  return Array.from(platformName.trim())[0]?.toUpperCase() || "·";
}

/** 图片失效时隐藏损坏图标，露出下层的平台首字母作为回退。 */
function handlePlatformIconError(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.hidden = true;
}
