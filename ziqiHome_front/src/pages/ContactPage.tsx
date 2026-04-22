import { useEffect, useState } from "react";
import { ArrowUpOutlined } from "@ant-design/icons";
import { PageHeader } from "../components/PageHeader";
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
      <PageHeader eyebrow="Contact" title="找我鸭" />

      {loading ? (
        <section className={styles.statePanel}>
          <p>鸡汤来喽哈哈哈！</p>
        </section>
      ) : error ? (
        <section className={styles.statePanel}>
          <p>{error}</p>
        </section>
      ) : contactLinks.length === 0 ? (
        <section className={styles.statePanel}>
          <p>哦吼？走丢了？先去别处看看吧！</p>
        </section>
      ) : (
        <section className={styles.grid}>
          {contactLinks.map((contactLink) => (
            <article key={contactLink.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.iconWrap}>
                  <img
                    src={contactLink.iconUrl}
                    alt={`${contactLink.platformName} 图标`}
                    className={styles.icon}
                  />
                </div>
                <div className={styles.titleWrap}>
                  <div className={styles.titleRow}>
                    <div>
                      <span className={styles.eyebrow}>公开平台</span>
                      <h3>{contactLink.platformName}</h3>
                    </div>

                    <a
                      href={contactLink.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.primaryLink}
                      aria-label={`访问 ${contactLink.platformName}`}
                      title={`访问 ${contactLink.platformName}`}
                    >
                      <ArrowUpOutlined />
                    </a>
                  </div>
                </div>
              </div>

              <p>{contactLink.description}</p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
