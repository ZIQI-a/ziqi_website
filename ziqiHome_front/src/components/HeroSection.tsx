import type { ProfileInfo } from "../types/content";
import styles from "./HeroSection.module.css";

interface HeroSectionProps {
  profile: ProfileInfo;
}

export function HeroSection({ profile }: HeroSectionProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.mask} />

      <div className={styles.centerCopy}>
        <div className={styles.copyWrap}>
          <p className={styles.kicker}>{profile.role}</p>
          <h1 className={styles.title}>"Welcome To ZIQI&apos;s HOME"</h1>
          <p className={styles.subtitle}>{profile.motto}</p>
          <p className={styles.byline}>BY {profile.englishName}</p>
        </div>

        {/* 首屏只保留向下指示，不再用按钮打断视觉中心。 */}
        <a
          className={styles.scrollHint}
          href="#home-about"
          aria-label="向下浏览"
        >
          <span className={styles.scrollLine} aria-hidden="true" />
          <span className={styles.scrollArrow} aria-hidden="true">
            &gt;
          </span>
        </a>
      </div>
    </section>
  );
}
