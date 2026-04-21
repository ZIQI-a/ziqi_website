import { PageHeader } from '../components/PageHeader'
import { profileInfo } from '../data/siteContent'
import styles from './ContactPage.module.css'

export function ContactPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Contact"
        title="找我鸭"
        description="把联系方式单独拆成页面后，顶部导航每一项都有独立去处，也更符合你现在想要的页面结构。"
      />

      <section className={styles.grid}>
        <article className={styles.card}>
          <h3>给我发邮件</h3>
          <p>适合聊项目、交流学习，或者单纯打个招呼。</p>
          <a href="mailto:ziqi@example.com" className={styles.primaryLink}>
            ziqi@example.com
          </a>
        </article>

        <article className={styles.card}>
          <h3>我的状态</h3>
          <p>{profileInfo.role}</p>
          <p>{profileInfo.location}</p>
          <p>主题偏向个人表达、前端学习与项目沉淀。</p>
        </article>
      </section>
    </div>
  )
}
