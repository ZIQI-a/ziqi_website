import { useDeferredValue, useEffect, useState } from 'react'
import {
  App,
  Button,
  Card,
  DatePicker,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { MarkdownArticle } from '../../components/MarkdownArticle'
import dayjs from 'dayjs'
import { ApiError, adminClient } from '../../api/adminClient'
import type {
  BlogAdminItem,
  BlogAdminPayload,
  BlogContentMode,
  BlogSourceType,
} from '../../types/admin'
import styles from './AdminBlogsPage.module.css'

const { TextArea } = Input

const emptyForm: BlogAdminPayload = {
  slug: '',
  title: '',
  publishDate: '',
  category: '',
  summary: '',
  cover: '',
  contentMarkdown: '',
  tags: [],
  contentMode: 'LOCAL',
  sourceType: 'ORIGINAL',
  sourceLabel: '',
  sourceUrl: '',
  published: true,
  sortOrder: 0,
}

const contentModeOptions: Array<{ label: string; value: BlogContentMode }> = [
  { label: '本站正文', value: 'LOCAL' },
  { label: '外链文章', value: 'EXTERNAL' },
  { label: '本站正文 + 原文出处', value: 'HYBRID' },
]

const sourceTypeOptions: Array<{ label: string; value: BlogSourceType }> = [
  { label: '原创', value: 'ORIGINAL' },
  { label: '语雀导入', value: 'YUQUE' },
  { label: 'CSDN', value: 'CSDN' },
  { label: '其他外部来源', value: 'EXTERNAL' },
]

interface BlogFormValues {
  slug: string
  title: string
  publishDate: dayjs.Dayjs | null
  category: string
  summary: string
  cover: string
  contentMarkdown: string
  tags: string
  contentMode: BlogContentMode
  sourceType: BlogSourceType
  sourceLabel: string
  sourceUrl: string
  published: boolean
  sortOrder: number
}

function formatListInput(values: string[]) {
  return values.join('\n')
}

function parseListInput(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function toFormValues(blog: BlogAdminItem | null): BlogFormValues {
  const source = blog ?? emptyForm

  return {
    slug: source.slug,
    title: source.title,
    publishDate: source.publishDate ? dayjs(source.publishDate) : null,
    category: source.category,
    summary: source.summary,
    cover: source.cover,
    contentMarkdown: source.contentMarkdown,
    tags: formatListInput(source.tags),
    contentMode: source.contentMode,
    sourceType: source.sourceType,
    sourceLabel: source.sourceLabel ?? '',
    sourceUrl: source.sourceUrl ?? '',
    published: source.published,
    sortOrder: source.sortOrder,
  }
}

/**
 * 把抽屉表单值整理回后端 DTO，保证博客管理页与后端字段契约保持稳定。
 */
function toPayload(values: BlogFormValues): BlogAdminPayload {
  return {
    slug: values.slug.trim(),
    title: values.title.trim(),
    publishDate: values.publishDate?.format('YYYY-MM-DD') ?? '',
    category: values.category.trim(),
    summary: values.summary.trim(),
    cover: values.cover.trim(),
    contentMarkdown: values.contentMarkdown.trim(),
    tags: parseListInput(values.tags),
    contentMode: values.contentMode,
    sourceType: values.sourceType,
    sourceLabel: values.sourceLabel.trim() || null,
    sourceUrl: values.sourceUrl.trim() || null,
    published: values.published,
    sortOrder: values.sortOrder,
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return '请求失败，请稍后重试'
}

export function AdminBlogsPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm<BlogFormValues>()
  const [blogs, setBlogs] = useState<BlogAdminItem[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState<BlogAdminItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const titleValue = Form.useWatch('title', form) ?? ''
  const summaryValue = Form.useWatch('summary', form) ?? ''
  const categoryValue = Form.useWatch('category', form) ?? ''
  const coverValue = Form.useWatch('cover', form) ?? ''
  const tagsValue = Form.useWatch('tags', form) ?? ''
  const contentMarkdownValue = Form.useWatch('contentMarkdown', form) ?? ''
  const contentModeValue = Form.useWatch('contentMode', form) ?? 'LOCAL'
  const sourceLabelValue = Form.useWatch('sourceLabel', form) ?? ''
  const sourceUrlValue = Form.useWatch('sourceUrl', form) ?? ''
  const deferredMarkdown = useDeferredValue(contentMarkdownValue)
  const previewTags = parseListInput(tagsValue)

  useEffect(() => {
    void loadBlogs()
  }, [])

  async function loadBlogs(options?: { silent?: boolean }) {
    const silent = options?.silent ?? false

    if (silent) {
      setRefreshing(true)
    } else {
      setInitialLoading(true)
    }

    setError(null)

    try {
      const data = await adminClient.listBlogs()
      setBlogs(data)
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      if (silent) {
        setRefreshing(false)
      } else {
        setInitialLoading(false)
      }
    }
  }

  function openCreateDrawer() {
    setEditingBlog(null)
    form.setFieldsValue(toFormValues(null))
    form.resetFields()
    setDrawerOpen(true)
  }

  function openEditDrawer(blog: BlogAdminItem) {
    setEditingBlog(blog)
    form.setFieldsValue(toFormValues(blog))
    setDrawerOpen(true)
  }

  function closeDrawer() {
    setDrawerOpen(false)
    setEditingBlog(null)
    form.resetFields()
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    try {
      const values = await form.validateFields()
      const payload = toPayload(values)

      if (editingBlog === null) {
        await adminClient.createBlog(payload)
        message.success('博客创建成功。')
      } else {
        await adminClient.updateBlog(editingBlog.id, payload)
        message.success('博客更新成功。')
      }

      closeDrawer()
      await loadBlogs({ silent: true })
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        if (submitError.fieldErrors) {
          form.setFields(
            Object.entries(submitError.fieldErrors).map(([name, errors]) => ({
              name: name as keyof BlogFormValues,
              errors: [errors],
            })),
          )
        }
        setError(submitError.message)
        return
      }

      if ((submitError as { errorFields?: unknown[] }).errorFields) {
        return
      }

      setError(getErrorMessage(submitError))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(blog: BlogAdminItem) {
    setError(null)

    try {
      await adminClient.deleteBlog(blog.id)
      if (editingBlog?.id === blog.id) {
        closeDrawer()
      }
      message.success(`博客「${blog.title}」已删除。`)
      await loadBlogs({ silent: true })
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    }
  }

  const columns: ColumnsType<BlogAdminItem> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (_, blog) => (
        <div className={styles.blogCell}>
          <Typography.Text strong>{blog.title}</Typography.Text>
          <Typography.Text type="secondary">
            {blog.category} · {blog.publishDate}
          </Typography.Text>
          <Typography.Text type="secondary">
            {blog.contentMode === 'EXTERNAL' ? '外链文章' : '本站文章'}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      key: 'summary',
      render: (summary: string) => (
        <Typography.Paragraph
          className={styles.summary}
          ellipsis={{ rows: 2, tooltip: summary }}
        >
          {summary}
        </Typography.Paragraph>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <Space size={[8, 8]} wrap>
          {tags.slice(0, 3).map((tag) => (
            <Tag key={tag} bordered={false} className={styles.tagChip}>
              {tag}
            </Tag>
          ))}
          {tags.length > 3 ? (
            <Typography.Text type="secondary">+{tags.length - 3}</Typography.Text>
          ) : null}
        </Space>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 96,
    },
    {
      title: '发布',
      dataIndex: 'published',
      key: 'published',
      width: 120,
      render: (published: boolean) =>
        published ? (
          <Tag color="gold" bordered={false}>
            已发布
          </Tag>
        ) : (
          <Tag bordered={false}>未发布</Tag>
        ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 168,
      render: (_, blog) => (
        <Space size={8}>
          <Button icon={<EditOutlined />} onClick={() => openEditDrawer(blog)}>
            编辑
          </Button>
          <Popconfirm
            overlayClassName={styles.deleteConfirm}
            title={`确认删除博客「${blog.title}」吗？`}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(blog)}
          >
            <Button danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <section className={styles.page}>
      <Card bordered={false} className={styles.panel}>
        <AdminPageHeader
          eyebrow="Blog CRUD"
          title="博客管理"
          actions={
            <>
              <Button
                icon={<ReloadOutlined />}
                loading={refreshing}
                onClick={() => void loadBlogs({ silent: true })}
              >
                刷新
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateDrawer}
              >
                新建博客
              </Button>
            </>
          }
        />

        {error ? (
          <Typography.Paragraph className={styles.errorText}>
            {error}
          </Typography.Paragraph>
        ) : null}

        {initialLoading ? (
          <div className={styles.loadingWrap}>
            <Spin size="large" />
          </div>
        ) : blogs.length === 0 ? (
          <Empty description="当前还没有博客记录。" className={styles.emptyState} />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={blogs}
            loading={refreshing}
            pagination={false}
            scroll={{ x: 980 }}
            className={styles.table}
          />
        )}
      </Card>

      <Drawer
        title={editingBlog === null ? '新建博客' : `编辑博客 · ${editingBlog.title}`}
        open={drawerOpen}
        onClose={closeDrawer}
        width={1180}
        destroyOnHidden
        extra={
          <Space>
            <Button onClick={closeDrawer}>取消</Button>
            <Button type="primary" loading={submitting} onClick={() => void handleSubmit()}>
              {editingBlog === null ? '创建博客' : '保存修改'}
            </Button>
          </Space>
        }
      >
        <div className={styles.editorLayout}>
          <Form
            form={form}
            layout="vertical"
            initialValues={toFormValues(null)}
            className={styles.form}
          >
            <Form.Item
              label="slug"
              name="slug"
              rules={[{ required: true, message: '请输入 slug' }]}
            >
              <Input placeholder="react-routing-notes" />
            </Form.Item>

            <Form.Item
              label="标题"
              name="title"
              rules={[{ required: true, message: '请输入标题' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="发布日期"
              name="publishDate"
              rules={[{ required: true, message: '请选择发布日期' }]}
            >
              <DatePicker className={styles.fullControl} />
            </Form.Item>

            <Form.Item
              label="分类"
              name="category"
              rules={[{ required: true, message: '请输入分类' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="封面 URL"
              name="cover"
              rules={[
                { required: true, message: '请输入封面地址' },
                { type: 'url', message: '请输入有效的 URL' },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="内容模式"
              name="contentMode"
              rules={[{ required: true, message: '请选择内容模式' }]}
            >
              <Select options={contentModeOptions} />
            </Form.Item>

            <Form.Item
              label="来源类型"
              name="sourceType"
              rules={[{ required: true, message: '请选择来源类型' }]}
            >
              <Select options={sourceTypeOptions} />
            </Form.Item>

            <Form.Item
              label="来源名称"
              name="sourceLabel"
              extra="例如：语雀、CSDN、掘金。原创文章可留空。"
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="原文链接"
              name="sourceUrl"
              rules={[{ type: 'url', message: '请输入有效的 URL' }]}
              extra="外链文章或保留出处时填写。"
            >
              <Input placeholder="https://www.yuque.com/..." />
            </Form.Item>

            <Form.Item
              label="排序值"
              name="sortOrder"
              rules={[{ required: true, message: '请输入排序值' }]}
            >
              <InputNumber className={styles.fullControl} />
            </Form.Item>

            <Form.Item
              label="摘要"
              name="summary"
              rules={[{ required: true, message: '请输入摘要' }]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              label="标签"
              name="tags"
              rules={[{ required: true, message: '请至少填写一个标签' }]}
              extra="一行一个，提交前会转换成数组。"
            >
              <TextArea rows={5} placeholder={'React\nRouter\n学习记录'} />
            </Form.Item>

            <Form.Item
              label="Markdown 正文"
              name="contentMarkdown"
              rules={[{ required: true, message: '请输入文章正文' }]}
              extra="支持 GFM：标题、列表、表格、引用、代码块和图片。"
            >
              <TextArea
                rows={18}
                className={styles.markdownEditor}
                placeholder={'# 标题\n\n这里开始写正文...\n\n- 列表项\n- 第二项'}
              />
            </Form.Item>

            <Form.Item
              label="发布状态"
              name="published"
              valuePropName="checked"
            >
              <Switch checkedChildren="已发布" unCheckedChildren="未发布" />
            </Form.Item>
          </Form>

          <aside className={styles.previewPanel}>
            <div className={styles.previewHeader}>
              <Typography.Title level={4} className={styles.previewTitle}>
                实时预览
              </Typography.Title>
              <Typography.Text type="secondary">
                与前台详情页使用同一套 Markdown 渲染规则
              </Typography.Text>
            </div>

            <div className={styles.previewMeta}>
              <Typography.Title level={2} className={styles.previewPostTitle}>
                {titleValue.trim() || '未命名文章'}
              </Typography.Title>
              <Typography.Paragraph className={styles.previewSummary}>
                {summaryValue.trim() || '这里会展示文章摘要。'}
              </Typography.Paragraph>
              <div className={styles.previewInfoRow}>
                <span>{categoryValue.trim() || '未分类'}</span>
                <span>{contentModeValue === 'EXTERNAL' ? '外链文章' : '本站文章'}</span>
                {sourceLabelValue.trim() ? <span>{sourceLabelValue.trim()}</span> : null}
                {sourceUrlValue.trim() ? (
                  <a href={sourceUrlValue.trim()} target="_blank" rel="noreferrer">
                    原文链接
                  </a>
                ) : null}
              </div>
              {coverValue.trim() ? (
                <img className={styles.previewCover} src={coverValue.trim()} alt={titleValue || '封面'} />
              ) : null}
              {previewTags.length > 0 ? (
                <div className={styles.previewTags}>
                  {previewTags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className={styles.previewBody}>
              {contentModeValue === 'EXTERNAL' ? (
                <Typography.Paragraph className={styles.previewHint}>
                  当前文章会优先作为外链分发，站内正文仍可作为备份或导入草稿保留。
                </Typography.Paragraph>
              ) : null}

              {deferredMarkdown.trim() ? (
                <MarkdownArticle markdown={deferredMarkdown} />
              ) : (
                <Typography.Paragraph className={styles.previewHint}>
                  输入 Markdown 后，这里会实时显示排版效果。
                </Typography.Paragraph>
              )}
            </div>
          </aside>
        </div>
      </Drawer>
    </section>
  )
}
