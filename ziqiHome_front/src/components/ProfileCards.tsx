import type { ProfileInfo } from '../types/content'
import styles from './ProfileCards.module.css'

interface ProfileCardsProps {
  profile: ProfileInfo
}

export function ProfileCards({ profile }: ProfileCardsProps) {
  return (
    <section className={styles.section}>
      <div className={styles.panel}>
        <div className={styles.glass} />

        <div className={styles.content}>
          <h2 className={styles.title}>关于我</h2>

          <aside className={styles.leftCol}>
            <p>
              {profile.identityTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </p>
          </aside>

          <div className={styles.rightCol}>
            {profile.storyCards.map((card) => (
              <article key={card.title} className={styles.reasonItem}>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
