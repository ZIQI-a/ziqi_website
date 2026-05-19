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
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          /**
           * 语雀 CDN 图片对网页 Referer 有防盗链限制，这里主动去掉 Referer，
           * 避免站内展示语雀外链图片时被 403 拦截。
           */
          img: ({ src, alt }) => (
            <img
              src={src ?? ''}
              alt={alt ?? ''}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
