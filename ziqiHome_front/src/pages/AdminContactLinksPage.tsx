import { useEffect, useState } from 'react'
import {
  App,
  Button,
  Card,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Popconfirm,
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
import { AdminPageHeader } from '../components/admin/AdminPageHeader'
import { ApiError, adminClient } from '../api/adminClient'
import type {
  ContactLinkAdminItem,
  ContactLinkAdminPayload,
} from '../types/admin'
import styles from './AdminContactLinksPage.module.css'

const emptyForm: ContactLinkAdminPayload = {
  platformName: '',
  profileUrl: '',
  iconUrl: '',
  description: '',
  published: true,
  sortOrder: 0,
}

interface ContactLinkFormValues {
  platformName: string
  profileUrl: string
  iconUrl: string
  description: string
  published: boolean
  sortOrder: number
}

function toFormValues(contactLink: ContactLinkAdminItem | null): ContactLinkFormValues {
  const source = contactLink ?? emptyForm

  return {
    platformName: source.platformName,
    profileUrl: source.profileUrl,
    iconUrl: source.iconUrl,
    description: source.description,
    published: source.published,
    sortOrder: source.sortOrder,
  }
}

/**
 * 联系平台管理直接对齐后端 DTO，避免页面层堆积额外字段转换。
 */
function toPayload(values: ContactLinkFormValues): ContactLinkAdminPayload {
  return {
    platformName: values.platformName.trim(),
    profileUrl: values.profileUrl.trim(),
    iconUrl: values.iconUrl.trim(),
    description: values.description.trim(),
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

export function AdminContactLinksPage() {
  const { message } = App.useApp()
  const [form] = Form.useForm<ContactLinkFormValues>()
  const [contactLinks, setContactLinks] = useState<ContactLinkAdminItem[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingContactLink, setEditingContactLink] =
    useState<ContactLinkAdminItem | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void loadContactLinks()
  }, [])

  async function loadContactLinks(options?: { silent?: boolean }) {
    const silent = options?.silent ?? false

    if (silent) {
      setRefreshing(true)
    } else {
      setInitialLoading(true)
    }

    setError(null)

    try {
      const data = await adminClient.listContactLinks()
      setContactLinks(data)
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
    setEditingContactLink(null)
    form.resetFields()
    form.setFieldsValue(toFormValues(null))
    setDrawerOpen(true)
  }

  function openEditDrawer(contactLink: ContactLinkAdminItem) {
    setEditingContactLink(contactLink)
    form.resetFields()
    form.setFieldsValue(toFormValues(contactLink))
    setDrawerOpen(true)
  }

  function closeDrawer() {
    setDrawerOpen(false)
    setEditingContactLink(null)
    form.resetFields()
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    try {
      const values = await form.validateFields()
      const payload = toPayload(values)

      if (editingContactLink === null) {
        await adminClient.createContactLink(payload)
        message.success('联系平台创建成功。')
      } else {
        await adminClient.updateContactLink(editingContactLink.id, payload)
        message.success('联系平台更新成功。')
      }

      closeDrawer()
      await loadContactLinks({ silent: true })
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        if (submitError.fieldErrors) {
          form.setFields(
            Object.entries(submitError.fieldErrors).map(([name, errors]) => ({
              name: name as keyof ContactLinkFormValues,
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

  async function handleDelete(contactLink: ContactLinkAdminItem) {
    setError(null)

    try {
      await adminClient.deleteContactLink(contactLink.id)
      if (editingContactLink?.id === contactLink.id) {
        closeDrawer()
      }
      message.success(`联系平台「${contactLink.platformName}」已删除。`)
      await loadContactLinks({ silent: true })
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    }
  }

  const columns: ColumnsType<ContactLinkAdminItem> = [
    {
      title: '平台',
      dataIndex: 'platformName',
      key: 'platformName',
      render: (_, contactLink) => (
        <div className={styles.platformCell}>
          <img
            src={contactLink.iconUrl}
            alt={`${contactLink.platformName} 图标`}
            className={styles.platformIcon}
          />
          <div className={styles.platformMeta}>
            <Typography.Text strong>{contactLink.platformName}</Typography.Text>
            <Typography.Text type="secondary" className={styles.urlText}>
              {contactLink.profileUrl}
            </Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
        <Typography.Paragraph
          className={styles.summary}
          ellipsis={{ rows: 2, tooltip: description }}
        >
          {description}
        </Typography.Paragraph>
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
      render: (_, contactLink) => (
        <Space size={8}>
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditDrawer(contactLink)}
          >
            编辑
          </Button>
          <Popconfirm
            overlayClassName={styles.deleteConfirm}
            title={`确认删除平台「${contactLink.platformName}」吗？`}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(contactLink)}
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
          eyebrow="Contact CRUD"
          title="联系平台管理"
          actions={
            <>
              <Button
                icon={<ReloadOutlined />}
                loading={refreshing}
                onClick={() => void loadContactLinks({ silent: true })}
              >
                刷新
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateDrawer}
              >
                新建平台
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
        ) : contactLinks.length === 0 ? (
          <Empty
            description="当前还没有联系平台记录。"
            className={styles.emptyState}
          />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={contactLinks}
            loading={refreshing}
            pagination={false}
            scroll={{ x: 920 }}
            className={styles.table}
          />
        )}
      </Card>

      <Drawer
        title={
          editingContactLink === null
            ? '新建联系平台'
            : `编辑平台 · ${editingContactLink.platformName}`
        }
        open={drawerOpen}
        onClose={closeDrawer}
        width={560}
        destroyOnHidden
        extra={
          <Space>
            <Button onClick={closeDrawer}>取消</Button>
            <Button
              type="primary"
              loading={submitting}
              onClick={() => void handleSubmit()}
            >
              {editingContactLink === null ? '创建平台' : '保存修改'}
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={toFormValues(null)}
          className={styles.form}
        >
          <Form.Item
            label="平台名"
            name="platformName"
            rules={[{ required: true, message: '请输入平台名' }]}
          >
            <Input placeholder="Bilibili / YouTube / GitHub" />
          </Form.Item>

          <Form.Item
            label="主页链接"
            name="profileUrl"
            rules={[
              { required: true, message: '请输入主页链接' },
              { type: 'url', message: '请输入有效的 URL' },
            ]}
          >
            <Input placeholder="https://example.com/profile" />
          </Form.Item>

          <Form.Item
            label="图标链接"
            name="iconUrl"
            rules={[
              { required: true, message: '请输入图标链接' },
              { type: 'url', message: '请输入有效的 URL' },
            ]}
            extra="当前阶段直接使用远程图标链接，后续若引入素材管理再单独扩展。"
          >
            <Input placeholder="https://example.com/icon.png" />
          </Form.Item>

          <Form.Item
            label="排序值"
            name="sortOrder"
            rules={[{ required: true, message: '请输入排序值' }]}
          >
            <InputNumber className={styles.fullControl} />
          </Form.Item>

          <Form.Item
            label="平台描述"
            name="description"
            rules={[{ required: true, message: '请输入平台描述' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item label="发布状态" name="published" valuePropName="checked">
            <Switch checkedChildren="已发布" unCheckedChildren="未发布" />
          </Form.Item>
        </Form>
      </Drawer>
    </section>
  )
}
