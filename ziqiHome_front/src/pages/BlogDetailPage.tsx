import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { siteClient } from '../api/siteClient'
import { MarkdownArticle } from '../components/MarkdownArticle'
import { BlogPostToc } from '../components/BlogPostToc'
import { extractTocHeadings } from '../utils/tocUtils'
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

  const tocHeadings = useMemo(
    () => (post ? extractTocHeadings(post.contentMarkdown) : []),
    [post],
  )

  if (loading) {
    return <section className={styles.statePanel}>正在加载文章...</section>
  }

  if (error || post === null) {
    return <section className={styles.statePanel}>{error ?? '文章不存在'}</section>
  }

  if (post.contentMode === 'EXTERNAL' && post.sourceUrl) {
    return (
      <section className={styles.pageLayout}>
        <article className={styles.articleContent}>
          <PageHeader eyebrow="Blog Redirect" title={post.title} description={post.summary} />
          <div className={styles.statePanel}>
            <p>这篇文章托管在外部平台。</p>
            <p>
              <a href={post.sourceUrl} target="_blank" rel="noreferrer">
                前往{post.sourceLabel ?? '原文'}
              </a>
            </p>
          </div>
        </article>
      </section>
    )
  }

  return (
    <div className={styles.pageLayout}>
      <article className={styles.articleContent}>
        <img className={styles.cover} src={post.cover} alt={post.title} loading="lazy" />

        <section className={styles.articleShell}>
          <div className={styles.actionRow}>
            <Link to="/blog" className={styles.actionButton}>
              返回博客列表
            </Link>
            {post.sourceUrl ? (
              <a href={post.sourceUrl} target="_blank" rel="noreferrer" className={styles.actionButton}>
                查看{post.sourceLabel ?? '原文'}
              </a>
            ) : null}
          </div>

          <header className={styles.articleHeader}>
            <div className={styles.metaRow}>
              <span>{post.category}</span>
              <span>{post.date}</span>
            </div>

            <h1 className={styles.title}>{post.title}</h1>
            <p className={styles.summary}>{post.summary}</p>

            <div className={styles.tags}>
              {post.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </header>

          <MarkdownArticle markdown={post.contentMarkdown} />
        </section>
      </article>

      <BlogPostToc headings={tocHeadings} />
    </div>
  )
}
