import { PageHeader } from '../components/PageHeader'
import { lifeMoments, recentUpdates } from '../data/siteContent'
import styles from './LatestPage.module.css'

export function LatestPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Latest"
        title="最新"
        description="这一页单独承接最近的动态和状态更新，让顶部导航中的“最新”成为独立页面，而不是只跳回首页的一小段内容。"
      />

      <section className={styles.updates}>
        {recentUpdates.map((update) => (
          <article key={update.id} className={styles.updateCard}>
            <span>{update.period}</span>
            <h3>{update.title}</h3>
            <p>{update.summary}</p>
          </article>
        ))}
      </section>

      <section className={styles.gallery}>
        {lifeMoments.slice(0, 4).map((moment) => (
          <article key={moment.id} className={styles.galleryCard}>
            <img src={moment.cover} alt={moment.title} />
            <div className={styles.galleryMeta}>
              <p>{moment.date}</p>
              <h3>{moment.title}</h3>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
