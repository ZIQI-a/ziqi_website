import { useEffect, useMemo, useRef, useState } from 'react'
import {
  App,
  Button,
  Card,
  Input,
  Spin,
  Typography,
} from 'antd'
import {
  ArrowLeftOutlined,
  BgColorsOutlined,
  BoldOutlined,
  CodeOutlined,
  EyeOutlined,
  LinkOutlined,
  OrderedListOutlined,
  PictureOutlined,
  SaveOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import type { TextAreaRef } from 'antd/es/input/TextArea'
import { useNavigate, useParams } from 'react-router-dom'
import { adminClient, ApiError } from '../../api/adminClient'
import { MarkdownArticle } from '../../components/MarkdownArticle'
import type { BlogAdminItem, BlogAdminPayload } from '../../types/admin'
import styles from './AdminBlogEditorPage.module.css'

const { TextArea } = Input

const DEFAULT_BLOG_COVER =
  'https://myphoto-1307175277.cos.ap-chengdu.myqcloud.com/mywebsite/image/time3.jpg'

interface EditorDraft {
  title: string
  contentMarkdown: string
}

function slugify(value: string) {
  const ascii = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return ascii || `blog-${Date.now()}`
}

function extractSummary(markdown: string) {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_>~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return plainText.slice(0, 160) || '这是一篇新建中的文章。'
}

function buildPayload(draft: EditorDraft, existingBlog: BlogAdminItem | null, published: boolean): BlogAdminPayload {
  const normalizedTitle = draft.title.trim()
  const normalizedContent = draft.contentMarkdown.trim()

  if (existingBlog) {
    return {
      ...existingBlog,
      title: normalizedTitle,
      contentMarkdown: normalizedContent,
      summary: existingBlog.summary.trim() || extractSummary(normalizedContent),
      published,
    }
  }

  return {
    slug: slugify(normalizedTitle),
    title: normalizedTitle,
    publishDate: new Date().toISOString().slice(0, 10),
    category: '未分类',
    summary: extractSummary(normalizedContent),
    cover: DEFAULT_BLOG_COVER,
    contentMarkdown: normalizedContent,
    tags: ['待整理'],
    contentMode: 'LOCAL',
    sourceType: 'ORIGINAL',
    sourceLabel: null,
    sourceUrl: null,
    published,
    sortOrder: 0,
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return '保存失败，请稍后重试'
}

export function AdminBlogEditorPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { id } = useParams()
  const textareaRef = useRef<TextAreaRef>(null)
  const [draft, setDraft] = useState<EditorDraft>({ title: '', contentMarkdown: '' })
  const [existingBlog, setExistingBlog] = useState<BlogAdminItem | null>(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      return
    }

    async function loadBlog() {
      setLoading(true)
      setError(null)

      try {
        const data = await adminClient.getBlog(Number(id))
        setExistingBlog(data)
        setDraft({
          title: data.title,
          contentMarkdown: data.contentMarkdown,
        })
      } catch (loadError) {
        setError(getErrorMessage(loadError))
      } finally {
        setLoading(false)
      }
    }

    void loadBlog()
  }, [id])

  function updateDraft(patch: Partial<EditorDraft>) {
    setDraft((current) => ({ ...current, ...patch }))
  }

  function insertSnippet(snippet: string, fallbackSelection = '') {
    const textarea = textareaRef.current?.resizableTextArea?.textArea

    if (!textarea) {
      updateDraft({
        contentMarkdown: `${draft.contentMarkdown}${draft.contentMarkdown ? '\n' : ''}${snippet}`,
      })
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = draft.contentMarkdown.slice(start, end) || fallbackSelection
    const insertion = snippet.replace('{selection}', selectedText)
    const nextMarkdown =
      draft.contentMarkdown.slice(0, start) +
      insertion +
      draft.contentMarkdown.slice(end)

    updateDraft({ contentMarkdown: nextMarkdown })

    requestAnimationFrame(() => {
      textarea.focus()
      const cursor = start + insertion.length
      textarea.setSelectionRange(cursor, cursor)
    })
  }

  async function saveDraft(published: boolean) {
    const normalizedTitle = draft.title.trim()
    const normalizedContent = draft.contentMarkdown.trim()

    if (!normalizedTitle) {
      setError('请输入文章标题')
      return
    }

    if (!normalizedContent) {
      setError('请输入文章正文')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const payload = buildPayload(draft, existingBlog, published)
      const saved = existingBlog
        ? await adminClient.updateBlog(existingBlog.id, payload)
        : await adminClient.createBlog(payload)

      setExistingBlog(saved)
      if (!id) {
        navigate(`/admin/blogs/${saved.id}/editor`, { replace: true })
      }

      message.success(published ? '文章已发布。' : '草稿已保存。')
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setSaving(false)
    }
  }

  const wordCount = useMemo(() => {
    return draft.contentMarkdown.replace(/\s+/g, '').length
  }, [draft.contentMarkdown])

  const toolbarActions = [
    { label: 'H2', icon: <BgColorsOutlined />, handler: () => insertSnippet('\n## {selection}\n', '二级标题') },
    { label: '加粗', icon: <BoldOutlined />, handler: () => insertSnippet('**{selection}**', '重点内容') },
    { label: '无序列表', icon: <UnorderedListOutlined />, handler: () => insertSnippet('\n- {selection}\n', '列表项') },
    { label: '有序列表', icon: <OrderedListOutlined />, handler: () => insertSnippet('\n1. {selection}\n', '列表项') },
    { label: '代码块', icon: <CodeOutlined />, handler: () => insertSnippet('\n```ts\n{selection}\n```\n', 'console.log("hello")') },
    { label: '链接', icon: <LinkOutlined />, handler: () => insertSnippet('[{selection}](https://example.com)', '链接文本') },
    { label: '图片', icon: <PictureOutlined />, handler: () => insertSnippet('![{selection}](https://example.com/image.png)', '图片描述') },
  ]

  if (loading) {
    return (
      <section className={styles.loadingState}>
        <Spin size="large" />
      </section>
    )
  }

  return (
    <section className={styles.page}>
      <Card bordered={false} className={styles.shell}>
        <header className={styles.header}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/blogs')}>
            返回列表
          </Button>

          <Input
            value={draft.title}
            onChange={(event) => updateDraft({ title: event.target.value })}
            placeholder="请输入文章标题（5~100字）"
            maxLength={100}
            className={styles.titleInput}
          />

          <div className={styles.headerActions}>
            <Typography.Text type="secondary">{draft.title.trim().length}/100</Typography.Text>
            <Button
              icon={<SaveOutlined />}
              loading={saving}
              onClick={() => void saveDraft(false)}
            >
              保存草稿
            </Button>
            <Button
              type="primary"
              icon={<EyeOutlined />}
              loading={saving}
              onClick={() => void saveDraft(true)}
            >
              发布文章
            </Button>
          </div>
        </header>

        <div className={styles.toolbar}>
          {toolbarActions.map((action) => (
            <Button key={action.label} icon={action.icon} onClick={action.handler}>
              {action.label}
            </Button>
          ))}
        </div>

        {error ? <Typography.Paragraph className={styles.errorText}>{error}</Typography.Paragraph> : null}

        <div className={styles.workspace}>
          <div className={styles.editorPane}>
            <TextArea
              ref={textareaRef}
              value={draft.contentMarkdown}
              onChange={(event) => updateDraft({ contentMarkdown: event.target.value })}
              placeholder="在这里输入 Markdown 正文..."
              className={styles.editor}
            />
          </div>

          <div className={styles.previewPane}>
            <div className={styles.previewHeader}>
              <Typography.Title level={4} className={styles.previewTitle}>
                实时预览
              </Typography.Title>
              <Typography.Text type="secondary">
                {existingBlog ? '当前为正文编辑模式，其他字段请回列表页设置。' : '新建页仅保留标题和正文，其他字段会自动生成草稿值。'}
              </Typography.Text>
            </div>

            <div className={styles.previewMeta}>
              <Typography.Title level={2} className={styles.previewArticleTitle}>
                {draft.title.trim() || '未命名文章'}
              </Typography.Title>
              <Typography.Text type="secondary">
                字数 {wordCount} · {existingBlog?.published ? '当前已发布' : '草稿'}
              </Typography.Text>
            </div>

            <div className={styles.previewBody}>
              {draft.contentMarkdown.trim() ? (
                <MarkdownArticle markdown={draft.contentMarkdown} />
              ) : (
                <Typography.Paragraph className={styles.emptyPreview}>
                  输入 Markdown 后，这里会实时显示排版效果。
                </Typography.Paragraph>
              )}
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}
