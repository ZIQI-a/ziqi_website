import { useEffect, useState } from 'react'
import {
  lifeMoments,
  profileInfo,
  recentUpdates,
} from '../data/siteContent'
import { HeroSection } from '../components/HeroSection'
import { ProfileCards } from '../components/ProfileCards'
import styles from './HomePage.module.css'

const homeSections = [
  { id: 'home-hero', label: '主页' },
  { id: 'home-about', label: '关于我' },
  { id: 'home-life', label: '生活' },
  { id: 'home-latest', label: '最新' },
]

export function HomePage() {
  const [activeSection, setActiveSection] = useState(homeSections[0].id)
  const isHeroActive = activeSection === 'home-hero'

  useEffect(() => {
    // 用视口中心线命中 section，而不是按可见面积排序。
    const updateActiveSection = () => {
      const viewportCenterY = window.innerHeight * 0.46

      let matchedSectionId = homeSections[0].id
      let minDistance = Number.POSITIVE_INFINITY

      homeSections.forEach((section) => {
        const element = document.getElementById(section.id)

        if (!element) {
          return
        }

        const rect = element.getBoundingClientRect()
        const isCenterInsideSection =
          rect.top <= viewportCenterY && rect.bottom >= viewportCenterY

        if (isCenterInsideSection) {
          matchedSectionId = section.id
          minDistance = 0
          return
        }

        if (minDistance === 0) {
          return
        }

        const sectionCenterY = rect.top + rect.height / 2
        const distanceToViewportCenter = Math.abs(
          sectionCenterY - viewportCenterY,
        )

        if (distanceToViewportCenter < minDistance) {
          minDistance = distanceToViewportCenter
          matchedSectionId = section.id
        }
      })

      setActiveSection(matchedSectionId)
    }

    updateActiveSection()
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)

    return () => {
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [])

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
              activeSection === section.id ? styles.sideNavLinkActive : ''
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
          <div className={styles.lifeTabs}>
            <span className={styles.lifeTabActive}>全部</span>
            <span>生活</span>
            <span>学习</span>
            <span>随手记</span>
          </div>
        </div>

        <div className={styles.lifeGrid}>
          {lifeMoments.map((moment) => (
            <article key={moment.id} className={styles.lifeCard}>
              <img src={moment.cover} alt={moment.title} />
              <div className={styles.lifeOverlay} />
              <span className={styles.lifeArrow}>↗</span>
              <div className={styles.lifeMeta}>
                <p>{moment.date}</p>
                <h3>{moment.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="home-latest" className={styles.sectionWrap}>
        <div className={styles.sectionTitleWrap}>
          <h2 className={styles.sectionTitle}>最新</h2>
          <p className={styles.sectionDesc}>
            最近在学什么、在做什么、在慢慢把什么变成自己的东西。
          </p>
        </div>

        <div className={styles.latestGrid}>
          {recentUpdates.map((update) => (
            <article key={update.id} className={styles.latestCard}>
              <span>{update.period}</span>
              <h3>{update.title}</h3>
              <p>{update.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
