import type { TocHeading } from '../components/BlogPostToc'

/**
 * 从标题文本生成 HTML 锚点 id。
 * 与 MarkdownArticle 中的 slugifyHeading 保持完全一致。
 */
function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * 从 raw markdown 中提取所有 h1~h3 标题，生成 TOC 数据。
 */
export function extractTocHeadings(markdown: string): TocHeading[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm
  const headings: TocHeading[] = []
  let match: RegExpExecArray | null

  while ((match = headingRegex.exec(markdown)) !== null) {
    const text = match[2].trim()
    if (!text) continue
    headings.push({
      id: slugifyHeading(text),
      text,
      level: match[1].length,
    })
  }

  return headings
}
