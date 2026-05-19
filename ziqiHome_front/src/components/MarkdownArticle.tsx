import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import styles from './MarkdownArticle.module.css'

interface MarkdownArticleProps {
  markdown: string
}

/**
 * 统一封装 Markdown 渲染配置，保证后台预览和前台详情页的展示规则一致。
 */
export function MarkdownArticle({ markdown }: MarkdownArticleProps) {
  return (
    <div className={styles.article}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  )
}
