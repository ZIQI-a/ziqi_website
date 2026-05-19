import { useMemo, useState } from 'react'
import {
  Alert,
  App,
  Button,
  Card,
  Form,
  Input,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ArrowLeftOutlined, CloudSyncOutlined, ReloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { adminClient, ApiError } from '../../api/adminClient'
import type {
  YuqueSyncCommitPayload,
  YuqueSyncPreviewItem,
  YuqueSyncPreviewResponse,
} from '../../types/admin'
import styles from './AdminBlogSyncPage.module.css'

interface SyncFormValues {
  token: string
  repoNamespace: string
  defaultCategory: string
  defaultCover: string
  defaultTags: string
  publishImported: boolean
}

const DEFAULT_COVER =
  'https://myphoto-1307175277.cos.ap-chengdu.myqcloud.com/mywebsite/image/time3.jpg'

function parseTagInput(value: string) {
  return value
    .split(/[\n,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function formatTime(value: string | null) {
  if (!value) {
    return '未知时间'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-CN')
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

export function AdminBlogSyncPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [form] = Form.useForm<SyncFormValues>()
  const [preview, setPreview] = useState<YuqueSyncPreviewResponse | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const columns: ColumnsType<YuqueSyncPreviewItem> = [
    {
      title: '文章标题',
      dataIndex: 'title',
      key: 'title',
      render: (_, record) => (
        <div className={styles.titleCell}>
          <Typography.Text strong>{record.title}</Typography.Text>
          <Typography.Text type="secondary">{record.summary}</Typography.Text>
        </div>
      ),
    },
    {
      title: '建议',
      dataIndex: 'recommendedAction',
      key: 'recommendedAction',
      width: 120,
      render: (value: YuqueSyncPreviewItem['recommendedAction']) => {
        const colorMap = {
          CREATE: 'green',
          UPDATE: 'blue',
          SKIP: 'default',
        } as const

        const labelMap = {
          CREATE: '新建',
          UPDATE: '更新',
          SKIP: '已同步',
        } as const

        return <Tag color={colorMap[value]}>{labelMap[value]}</Tag>
      },
    },
    {
      title: '最近更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 190,
      render: (value) => formatTime(value),
    },
    {
      title: '站内文章',
      dataIndex: 'existingBlogTitle',
      key: 'existingBlogTitle',
      width: 220,
      render: (_, record) => record.existingBlogTitle ?? '尚未导入',
    },
  ]

  const selectedItems = useMemo(() => {
    if (!preview) {
      return []
    }

    const selectedSet = new Set(selectedRowKeys)
    return preview.items.filter((item) => selectedSet.has(item.docId))
  }, [preview, selectedRowKeys])

  async function handlePreview() {
    try {
      const values = await form.validateFields(['token', 'repoNamespace'])
      setLoading(true)
      setError(null)

      const data = await adminClient.previewYuqueSync({
        token: values.token,
        repoNamespace: values.repoNamespace,
      })

      setPreview(data)
      setSelectedRowKeys(
        data.items
          .filter((item) => item.recommendedAction !== 'SKIP')
          .map((item) => item.docId),
      )
    } catch (loadError) {
      if ((loadError as { errorFields?: unknown[] }).errorFields) {
        return
      }
      setError(getErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }

  async function handleSync() {
    try {
      const values = await form.validateFields()
      if (selectedItems.length === 0) {
        setError('请至少选择一篇需要同步的文章')
        return
      }

      setSyncing(true)
      setError(null)

      const payload: YuqueSyncCommitPayload = {
        token: values.token,
        repoNamespace: values.repoNamespace,
        selections: selectedItems.map((item) => ({
          docId: item.docId,
          slug: item.slug,
        })),
        defaultCategory: values.defaultCategory.trim(),
        defaultCover: values.defaultCover.trim(),
        defaultTags: parseTagInput(values.defaultTags),
        publishImported: values.publishImported,
      }

      const result = await adminClient.syncYuqueBlogs(payload)
      message.success(`同步完成：新建 ${result.createdCount} 篇，更新 ${result.updatedCount} 篇。`)
      await handlePreview()
    } catch (syncError) {
      if ((syncError as { errorFields?: unknown[] }).errorFields) {
        return
      }
      setError(getErrorMessage(syncError))
    } finally {
      setSyncing(false)
    }
  }

  return (
    <section className={styles.page}>
      <Card bordered={false} className={styles.panel}>
        <AdminPageHeader
          eyebrow="Yuque Sync"
          title="语雀文章同步"
          actions={
            <Space wrap>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/blogs')}>
                返回博客管理
              </Button>
              <Button icon={<ReloadOutlined />} loading={loading} onClick={() => void handlePreview()}>
                重新拉取
              </Button>
              <Button
                type="primary"
                icon={<CloudSyncOutlined />}
                loading={syncing}
                onClick={() => void handleSync()}
              >
                同步选中文章
              </Button>
            </Space>
          }
        />

        <Typography.Paragraph className={styles.helperText}>
          第一版同步不会保存你的 Token。输入语雀 Token 和知识库 namespace 后，系统会读取文档列表并按来源关系决定新建或更新。
        </Typography.Paragraph>

        {error ? <Alert type="error" showIcon message={error} className={styles.alert} /> : null}

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            defaultCategory: '博客',
            defaultCover: DEFAULT_COVER,
            defaultTags: '语雀同步',
            publishImported: false,
          }}
          className={styles.form}
        >
          <div className={styles.formGrid}>
            <Form.Item
              label="语雀 Token"
              name="token"
              rules={[{ required: true, message: '请输入语雀 Token' }]}
            >
              <Input.Password placeholder="从语雀设置里复制 Token" />
            </Form.Item>

            <Form.Item
              label="知识库 namespace"
              name="repoNamespace"
              rules={[{ required: true, message: '请输入知识库 namespace' }]}
              extra="示例：your-account/your-repo"
            >
              <Input placeholder="your-account/your-repo" />
            </Form.Item>

            <Form.Item
              label="默认分类"
              name="defaultCategory"
              rules={[{ required: true, message: '请输入默认分类' }]}
            >
              <Input placeholder="博客" />
            </Form.Item>

            <Form.Item
              label="默认封面"
              name="defaultCover"
              rules={[{ required: true, message: '请输入默认封面地址' }]}
            >
              <Input placeholder="https://..." />
            </Form.Item>

            <Form.Item
              label="默认标签"
              name="defaultTags"
              rules={[{ required: true, message: '请至少提供一个默认标签' }]}
              extra="支持换行或逗号分隔"
              className={styles.fullWidth}
            >
              <Input.TextArea rows={3} placeholder="语雀同步, 博客" />
            </Form.Item>

            <Form.Item
              label="同步后直接发布"
              name="publishImported"
              valuePropName="checked"
            >
              <Switch checkedChildren="发布" unCheckedChildren="草稿" />
            </Form.Item>
          </div>

          <Space>
            <Button type="primary" loading={loading} onClick={() => void handlePreview()}>
              读取语雀文档
            </Button>
          </Space>
        </Form>

        {preview ? (
          <div className={styles.resultPanel}>
            <div className={styles.resultMeta}>
              <Typography.Title level={4} className={styles.resultTitle}>
                读取到 {preview.totalCount} 篇文章
              </Typography.Title>
              <Typography.Text type="secondary">
                已选择 {selectedItems.length} 篇，默认会勾选需要新建或更新的文章。
              </Typography.Text>
            </div>

            <Table
              rowKey="docId"
              dataSource={preview.items}
              columns={columns}
              pagination={false}
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys,
                getCheckboxProps: (record) => ({
                  disabled: record.recommendedAction === 'SKIP',
                }),
              }}
              scroll={{ x: 860 }}
              className={styles.table}
            />
          </div>
        ) : null}
      </Card>
    </section>
  )
}
