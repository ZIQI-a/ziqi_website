import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { siteClient } from '../api/siteClient'
import { MarkdownArticle } from '../components/MarkdownArticle'
import { PageHeader } from '../components/PageHeader'
import type { BlogPostDetail } from '../types/content'
import styles from './BlogDetailPage.module.css'

/**
 * 第一阶段先直接展示 Markdown 原文，等后面接入专门的渲染器后再升级成富展示。
 */
export function BlogDetailPage() {
  const { slug = '' } = useParams()
  const [post, setPost] = useState<BlogPostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadBlog() {
      setLoading(true)
      setError(null)

      try {
        const data = await siteClient.getBlog(slug)
        setPost(data)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : '博客详情加载失败，请稍后重试')
      } finally {
        setLoading(false)
      }
    }

    void loadBlog()
  }, [slug])

  if (loading) {
    return <section className={styles.statePanel}>正在加载文章...</section>
  }

  if (error || post === null) {
    return <section className={styles.statePanel}>{error ?? '文章不存在'}</section>
  }

  if (post.contentMode === 'EXTERNAL' && post.sourceUrl) {
    return (
      <section className={styles.page}>
        <PageHeader eyebrow="Blog Redirect" title={post.title} description={post.summary} />
        <div className={styles.statePanel}>
          <p>这篇文章托管在外部平台。</p>
          <p>
            <a href={post.sourceUrl} target="_blank" rel="noreferrer">
              前往{post.sourceLabel ?? '原文'}
            </a>
          </p>
        </div>
      </section>
    )
  }

  return (
    <article className={styles.page}>
      <PageHeader eyebrow="Blog Detail" title={post.title} description={post.summary} />

      <div className={styles.metaRow}>
        <span>{post.category}</span>
        <span>{post.date}</span>
        {post.sourceUrl ? (
          <a href={post.sourceUrl} target="_blank" rel="noreferrer">
            查看{post.sourceLabel ?? '原文'}
          </a>
        ) : null}
      </div>

      <img className={styles.cover} src={post.cover} alt={post.title} />

      <div className={styles.tags}>
        {post.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      <MarkdownArticle markdown={post.contentMarkdown} />

      <Link to="/blog" className={styles.backLink}>
        返回博客列表
      </Link>
    </article>
  )
}
