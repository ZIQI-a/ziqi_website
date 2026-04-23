import { useEffect, useMemo, useState } from 'react'
import {
  App,
  Button,
  Card,
  Drawer,
  Empty,
  Form,
  Input,
  List,
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
  FolderOpenOutlined,
  PictureOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { ApiError, adminClient } from '../../api/adminClient'
import type {
  MomentAdminItem,
  MomentAdminPayload,
  MomentCategoryAdminItem,
  MomentCategoryAdminPayload,
} from '../../types/admin'
import styles from './AdminMomentsPage.module.css'

const { TextArea } = Input

interface MomentFormValues {
  content: string
  imageUrl: string
  imageAlt: string
  categoryId: number
  published: boolean
  showOnHome: boolean
  pinned: boolean
}

interface CategoryFormValues {
  name: string
}

const emptyMomentForm: MomentFormValues = {
  content: '',
  imageUrl: '',
  imageAlt: '',
  categoryId: 0,
  published: true,
  showOnHome: true,
  pinned: false,
}

function toMomentFormValues(
  moment: MomentAdminItem | null,
  categories: MomentCategoryAdminItem[],
): MomentFormValues {
  if (moment) {
    return {
      content: moment.content,
      imageUrl: moment.imageUrl ?? '',
      imageAlt: moment.imageAlt ?? '',
      categoryId: moment.category.id,
      published: moment.published,
      showOnHome: moment.showOnHome,
      pinned: moment.pinned,
    }
  }

  return {
    ...emptyMomentForm,
    // 新建时默认选第一个分类，避免出现空选择造成额外一步操作。
    categoryId: categories[0]?.id ?? 0,
  }
}

function toCategoryFormValues(category: MomentCategoryAdminItem | null): CategoryFormValues {
  return {
    name: category?.name ?? '',
  }
}

/**
 * 发送给后端前统一处理可选字段，避免把空字符串传进后端校验。
 */
function toMomentPayload(values: MomentFormValues): MomentAdminPayload {
  return {
    content: values.content.trim(),
    imageUrl: normalizeOptionalValue(values.imageUrl),
    imageAlt: normalizeOptionalValue(values.imageAlt),
    categoryId: values.categoryId,
    published: values.published,
    showOnHome: values.showOnHome,
    pinned: values.pinned,
  }
}

function toCategoryPayload(values: CategoryFormValues): MomentCategoryAdminPayload {
  return {
    name: values.name.trim(),
  }
}

function normalizeOptionalValue(value: string) {
  const trimmedValue = value.trim()
  return trimmedValue ? trimmedValue : null
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function AdminMomentsPage() {
  const { message } = App.useApp()
  const [momentForm] = Form.useForm<MomentFormValues>()
  const [categoryForm] = Form.useForm<CategoryFormValues>()
  const [moments, setMoments] = useState<MomentAdminItem[]>([])
  const [categories, setCategories] = useState<MomentCategoryAdminItem[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [momentSubmitting, setMomentSubmitting] = useState(false)
  const [categorySubmitting, setCategorySubmitting] = useState(false)
  const [momentDrawerOpen, setMomentDrawerOpen] = useState(false)
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false)
  const [editingMoment, setEditingMoment] = useState<MomentAdminItem | null>(null)
  const [editingCategory, setEditingCategory] = useState<MomentCategoryAdminItem | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void loadPageData()
  }, [])

  async function loadPageData(options?: { silent?: boolean }) {
    const silent = options?.silent ?? false

    if (silent) {
      setRefreshing(true)
    } else {
      setInitialLoading(true)
    }

    setError(null)

    try {
      // 动态和分类需要一起更新，保证表格、抽屉选项和右侧统计始终一致。
      const [momentData, categoryData] = await Promise.all([
        adminClient.listMoments(),
        adminClient.listMomentCategories(),
      ])

      setMoments(momentData)
      setCategories(categoryData)
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

  const categoryMomentCount = useMemo(() => {
    return moments.reduce<Record<number, number>>((result, moment) => {
      result[moment.category.id] = (result[moment.category.id] ?? 0) + 1
      return result
    }, {})
  }, [moments])

  function openCreateMomentDrawer() {
    if (categories.length === 0) {
      message.warning('请先创建分类，再新增动态。')
      openCreateCategoryDrawer()
      return
    }

    setEditingMoment(null)
    momentForm.resetFields()
    momentForm.setFieldsValue(toMomentFormValues(null, categories))
    setMomentDrawerOpen(true)
  }

  function openEditMomentDrawer(moment: MomentAdminItem) {
    setEditingMoment(moment)
    momentForm.resetFields()
    momentForm.setFieldsValue(toMomentFormValues(moment, categories))
    setMomentDrawerOpen(true)
  }

  function closeMomentDrawer() {
    setMomentDrawerOpen(false)
    setEditingMoment(null)
    momentForm.resetFields()
  }

  function openCreateCategoryDrawer() {
    setEditingCategory(null)
    categoryForm.resetFields()
    categoryForm.setFieldsValue(toCategoryFormValues(null))
    setCategoryDrawerOpen(true)
  }

  function openEditCategoryDrawer(category: MomentCategoryAdminItem) {
    setEditingCategory(category)
    categoryForm.resetFields()
    categoryForm.setFieldsValue(toCategoryFormValues(category))
    setCategoryDrawerOpen(true)
  }

  function closeCategoryDrawer() {
    setCategoryDrawerOpen(false)
    setEditingCategory(null)
    categoryForm.resetFields()
  }

  async function handleMomentSubmit() {
    setMomentSubmitting(true)
    setError(null)

    try {
      const values = await momentForm.validateFields()
      const payload = toMomentPayload(values)

      if (editingMoment === null) {
        await adminClient.createMoment(payload)
        message.success('动态创建成功。')
      } else {
        await adminClient.updateMoment(editingMoment.id, payload)
        message.success('动态更新成功。')
      }

      closeMomentDrawer()
      await loadPageData({ silent: true })
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        if (submitError.fieldErrors) {
          momentForm.setFields(
            Object.entries(submitError.fieldErrors).map(([name, errors]) => ({
              name: name as keyof MomentFormValues,
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
      setMomentSubmitting(false)
    }
  }

  async function handleCategorySubmit() {
    setCategorySubmitting(true)
    setError(null)

    try {
      const values = await categoryForm.validateFields()
      const payload = toCategoryPayload(values)

      if (editingCategory === null) {
        await adminClient.createMomentCategory(payload)
        message.success('分类创建成功。')
      } else {
        await adminClient.updateMomentCategory(editingCategory.id, payload)
        message.success('分类更新成功。')
      }

      closeCategoryDrawer()
      await loadPageData({ silent: true })
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        if (submitError.fieldErrors) {
          categoryForm.setFields(
            Object.entries(submitError.fieldErrors).map(([name, errors]) => ({
              name: name as keyof CategoryFormValues,
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
      setCategorySubmitting(false)
    }
  }

  async function handleDeleteMoment(moment: MomentAdminItem) {
    setError(null)

    try {
      await adminClient.deleteMoment(moment.id)

      if (editingMoment?.id === moment.id) {
        closeMomentDrawer()
      }

      message.success('动态已删除。')
      await loadPageData({ silent: true })
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    }
  }

  async function handleDeleteCategory(category: MomentCategoryAdminItem) {
    setError(null)

    try {
      await adminClient.deleteMomentCategory(category.id)

      if (editingCategory?.id === category.id) {
        closeCategoryDrawer()
      }

      message.success(`分类「${category.name}」已删除。`)
      await loadPageData({ silent: true })
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    }
  }

  const momentColumns: ColumnsType<MomentAdminItem> = [
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      render: (_, moment) => (
        <div className={styles.contentCell}>
          <Space size={10} align="start">
            <div className={styles.contentIcon}>
              {moment.imageUrl ? <PictureOutlined /> : <FolderOpenOutlined />}
            </div>
            <div className={styles.contentMeta}>
              <Typography.Paragraph
                ellipsis={{ rows: 2, tooltip: moment.content }}
                className={styles.contentText}
              >
                {moment.content}
              </Typography.Paragraph>
              <Typography.Text type="secondary">
                {moment.imageUrl ? '图文动态' : '文字动态'} · {formatDateTime(moment.createdAt)}
              </Typography.Text>
            </div>
          </Space>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 120,
      render: (categoryName: string) => (
        <Tag bordered={false} className={styles.categoryTag}>
          {categoryName}
        </Tag>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 220,
      render: (_, moment) => (
        <Space size={[8, 8]} wrap>
          {moment.published ? (
            <Tag color="gold" bordered={false}>
              已发布
            </Tag>
          ) : (
            <Tag bordered={false}>未发布</Tag>
          )}
          {moment.showOnHome ? (
            <Tag bordered={false} className={styles.infoTag}>
              首页展示
            </Tag>
          ) : null}
          {moment.pinned ? (
            <Tag bordered={false} className={styles.infoTag}>
              置顶
            </Tag>
          ) : null}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      render: (_, moment) => (
        <Space size={8} wrap>
          <Button icon={<EditOutlined />} onClick={() => openEditMomentDrawer(moment)}>
            编辑
          </Button>
          <Popconfirm
            overlayClassName={styles.deleteConfirm}
            title="确认删除这条动态吗？"
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDeleteMoment(moment)}
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
      <div className={styles.grid}>
        <Card bordered={false} className={styles.panel}>
          <AdminPageHeader
            eyebrow="Moments CRUD"
            title="动态管理"
            actions={
              <>
                <Button
                  icon={<ReloadOutlined />}
                  loading={refreshing}
                  onClick={() => void loadPageData({ silent: true })}
                >
                  刷新
                </Button>
                <Button icon={<PlusOutlined />} onClick={openCreateCategoryDrawer}>
                  新建分类
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreateMomentDrawer}>
                  新建动态
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
          ) : moments.length === 0 ? (
            <Empty description="当前还没有动态记录。" className={styles.emptyState} />
          ) : (
            <Table
              rowKey="id"
              columns={momentColumns}
              dataSource={moments}
              loading={refreshing}
              pagination={false}
              scroll={{ x: 920 }}
              className={styles.table}
            />
          )}
        </Card>

        <Card bordered={false} className={styles.sidePanel}>
          <div className={styles.sideHeader}>
            <div>
              <Typography.Text className={styles.sideEyebrow}>
                Moment Categories
              </Typography.Text>
              <Typography.Title level={4} className={styles.sideTitle}>
                分类列表
              </Typography.Title>
            </div>
            <Button icon={<PlusOutlined />} onClick={openCreateCategoryDrawer}>
              新建
            </Button>
          </div>

          {initialLoading ? (
            <div className={styles.loadingWrap}>
              <Spin />
            </div>
          ) : categories.length === 0 ? (
            <Empty description="还没有分类。" className={styles.emptyState} />
          ) : (
            <List
              dataSource={categories}
              className={styles.categoryList}
              renderItem={(category) => (
                <List.Item
                  className={styles.categoryItem}
                  actions={[
                    <Button
                      key="edit"
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => openEditCategoryDrawer(category)}
                    >
                      编辑
                    </Button>,
                    <Popconfirm
                      key="delete"
                      overlayClassName={styles.deleteConfirm}
                      title={`确认删除分类「${category.name}」吗？`}
                      okText="删除"
                      cancelText="取消"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => handleDeleteCategory(category)}
                    >
                      <Button type="text" danger icon={<DeleteOutlined />}>
                        删除
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <div className={styles.categoryMeta}>
                    <Typography.Text strong>{category.name}</Typography.Text>
                    <Typography.Text type="secondary">
                      {categoryMomentCount[category.id] ?? 0} 条动态
                    </Typography.Text>
                  </div>
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>

      <Drawer
        title={editingMoment === null ? '新建动态' : `编辑动态 · ${editingMoment.category.name}`}
        open={momentDrawerOpen}
        onClose={closeMomentDrawer}
        width={560}
        destroyOnHidden
        extra={
          <Space>
            <Button onClick={closeMomentDrawer}>取消</Button>
            <Button type="primary" loading={momentSubmitting} onClick={() => void handleMomentSubmit()}>
              {editingMoment === null ? '创建动态' : '保存修改'}
            </Button>
          </Space>
        }
      >
        <Form
          form={momentForm}
          layout="vertical"
          initialValues={toMomentFormValues(null, categories)}
          className={styles.form}
        >
          <Form.Item
            label="内容"
            name="content"
            rules={[
              { required: true, message: '请输入动态内容' },
              { max: 1200, message: '内容长度不能超过 1200 字' },
            ]}
          >
            <TextArea rows={6} placeholder="输入这条动态想展示的文字内容" />
          </Form.Item>

          <Form.Item
            label="分类"
            name="categoryId"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select
              options={categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
              placeholder="请选择分类"
            />
          </Form.Item>

          <Form.Item
            label="图片链接"
            name="imageUrl"
            rules={[
              {
                validator: (_, value: string) => {
                  const normalizedValue = value.trim()

                  if (!normalizedValue) {
                    return Promise.resolve()
                  }

                  const isValidUrl = /^https?:\/\/.+/.test(normalizedValue)
                  return isValidUrl
                    ? Promise.resolve()
                    : Promise.reject(new Error('请输入有效的 http 或 https 图片链接'))
                },
              },
            ]}
          >
            <Input placeholder="https://example.com/moment.jpg" />
          </Form.Item>

          <Form.Item
            label="图片说明"
            name="imageAlt"
            rules={[{ max: 160, message: '图片说明长度不能超过 160 字' }]}
          >
            <Input placeholder="用于图片辅助说明，可选" />
          </Form.Item>

          <Form.Item label="发布状态" name="published" valuePropName="checked">
            <Switch checkedChildren="已发布" unCheckedChildren="未发布" />
          </Form.Item>

          <Form.Item label="展示到首页" name="showOnHome" valuePropName="checked">
            <Switch checkedChildren="展示" unCheckedChildren="不展示" />
          </Form.Item>

          <Form.Item label="置顶" name="pinned" valuePropName="checked">
            <Switch checkedChildren="置顶" unCheckedChildren="普通" />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title={editingCategory === null ? '新建分类' : `编辑分类 · ${editingCategory.name}`}
        open={categoryDrawerOpen}
        onClose={closeCategoryDrawer}
        width={420}
        destroyOnHidden
        extra={
          <Space>
            <Button onClick={closeCategoryDrawer}>取消</Button>
            <Button type="primary" loading={categorySubmitting} onClick={() => void handleCategorySubmit()}>
              {editingCategory === null ? '创建分类' : '保存修改'}
            </Button>
          </Space>
        }
      >
        <Form
          form={categoryForm}
          layout="vertical"
          initialValues={toCategoryFormValues(null)}
          className={styles.form}
        >
          <Form.Item
            label="分类名称"
            name="name"
            rules={[
              { required: true, message: '请输入分类名称' },
              { max: 40, message: '分类名称长度不能超过 40 字' },
            ]}
          >
            <Input placeholder="生活 / 学习 / 随手记" />
          </Form.Item>
        </Form>
      </Drawer>
    </section>
  )
}
