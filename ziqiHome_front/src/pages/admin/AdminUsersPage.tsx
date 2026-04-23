import { useEffect, useState } from 'react'
import {
  App,
  Button,
  Card,
  Drawer,
  Empty,
  Form,
  Input,
  Popconfirm,
  Segmented,
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
  LockOutlined,
  PlusOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { ApiError, adminClient } from '../../api/adminClient'
import type {
  UserAdminItem,
  UserCreatePayload,
  UserPasswordPayload,
  UserRole,
  UserUpdatePayload,
} from '../../types/admin'
import styles from './AdminUsersPage.module.css'

type DrawerMode = 'create' | 'edit' | 'password'

interface UserFormValues {
  username: string
  nickname: string
  role: UserRole
  enabled: boolean
  password: string
}

interface PasswordFormValues {
  password: string
}

const defaultRole = 'ADMIN'

const userRoleOptions = [{ label: 'ADMIN', value: defaultRole }]

/**
 * 用户管理页只维护后台账号所需字段，避免把登录态逻辑提前塞进页面层。
 */
function toUserFormValues(user: UserAdminItem | null): UserFormValues {
  return {
    username: user?.username ?? '',
    nickname: user?.nickname ?? '',
    role: user?.role ?? defaultRole,
    enabled: user?.enabled ?? true,
    password: '',
  }
}

function toCreatePayload(values: UserFormValues): UserCreatePayload {
  return {
    username: values.username.trim(),
    password: values.password,
    nickname: values.nickname.trim(),
    role: values.role,
    enabled: values.enabled,
  }
}

function toUpdatePayload(values: UserFormValues): UserUpdatePayload {
  return {
    username: values.username.trim(),
    nickname: values.nickname.trim(),
    role: values.role,
    enabled: values.enabled,
  }
}

function toPasswordPayload(values: PasswordFormValues): UserPasswordPayload {
  return {
    password: values.password,
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

function formatDateTime(value: string | null) {
  if (!value) {
    return '尚未登录'
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function AdminUsersPage() {
  const { message } = App.useApp()
  const [userForm] = Form.useForm<UserFormValues>()
  const [passwordForm] = Form.useForm<PasswordFormValues>()
  const [users, setUsers] = useState<UserAdminItem[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('create')
  const [activeUser, setActiveUser] = useState<UserAdminItem | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void loadUsers()
  }, [])

  async function loadUsers(options?: { silent?: boolean }) {
    const silent = options?.silent ?? false

    if (silent) {
      setRefreshing(true)
    } else {
      setInitialLoading(true)
    }

    setError(null)

    try {
      const data = await adminClient.listUsers()
      setUsers(data)
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

  function closeDrawer() {
    setDrawerOpen(false)
    setDrawerMode('create')
    setActiveUser(null)
    userForm.resetFields()
    passwordForm.resetFields()
  }

  function openCreateDrawer() {
    setDrawerMode('create')
    setActiveUser(null)
    userForm.resetFields()
    userForm.setFieldsValue(toUserFormValues(null))
    setDrawerOpen(true)
  }

  function openEditDrawer(user: UserAdminItem) {
    setDrawerMode('edit')
    setActiveUser(user)
    userForm.resetFields()
    userForm.setFieldsValue(toUserFormValues(user))
    setDrawerOpen(true)
  }

  function openPasswordDrawer(user: UserAdminItem) {
    setDrawerMode('password')
    setActiveUser(user)
    passwordForm.resetFields()
    setDrawerOpen(true)
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    try {
      if (drawerMode === 'password') {
        if (activeUser === null) {
          return
        }

        const values = await passwordForm.validateFields()
        await adminClient.updateUserPassword(activeUser.id, toPasswordPayload(values))
        message.success(`账号「${activeUser.username}」密码已更新。`)
      } else {
        const values = await userForm.validateFields()

        if (drawerMode === 'create') {
          await adminClient.createUser(toCreatePayload(values))
          message.success('用户创建成功。')
        } else if (activeUser !== null) {
          await adminClient.updateUser(activeUser.id, toUpdatePayload(values))
          message.success(`账号「${activeUser.username}」资料已更新。`)
        }
      }

      closeDrawer()
      await loadUsers({ silent: true })
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        if (submitError.fieldErrors) {
          if (drawerMode === 'password') {
            passwordForm.setFields(
              Object.entries(submitError.fieldErrors).map(([name, errors]) => ({
                name: name as keyof PasswordFormValues,
                errors: [errors],
              })),
            )
          } else {
            userForm.setFields(
              Object.entries(submitError.fieldErrors).map(([name, errors]) => ({
                name: name as keyof UserFormValues,
                errors: [errors],
              })),
            )
          }
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

  async function handleDelete(user: UserAdminItem) {
    setError(null)

    try {
      await adminClient.deleteUser(user.id)

      if (activeUser?.id === user.id) {
        closeDrawer()
      }

      message.success(`账号「${user.username}」已删除。`)
      await loadUsers({ silent: true })
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    }
  }

  const columns: ColumnsType<UserAdminItem> = [
    {
      title: '账号',
      dataIndex: 'username',
      key: 'username',
      render: (_, user) => (
        <div className={styles.userCell}>
          <Space size={10}>
            <div className={styles.userIcon}>
              <UserOutlined />
            </div>
            <div className={styles.userMeta}>
              <Typography.Text strong>{user.nickname}</Typography.Text>
              <Typography.Text type="secondary">{user.username}</Typography.Text>
            </div>
          </Space>
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: UserRole) => (
        <Tag bordered={false} className={styles.roleTag}>
          {role}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 120,
      render: (enabled: boolean) =>
        enabled ? (
          <Tag color="gold" bordered={false}>
            已启用
          </Tag>
        ) : (
          <Tag bordered={false}>已停用</Tag>
        ),
    },
    {
      title: '最近登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 180,
      render: (lastLoginAt: string | null) => (
        <Typography.Text type="secondary">
          {formatDateTime(lastLoginAt)}
        </Typography.Text>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 228,
      render: (_, user) => (
        <Space size={8} wrap>
          <Button icon={<EditOutlined />} onClick={() => openEditDrawer(user)}>
            编辑
          </Button>
          <Button icon={<LockOutlined />} onClick={() => openPasswordDrawer(user)}>
            改密
          </Button>
          <Popconfirm
            overlayClassName={styles.deleteConfirm}
            title={`确认删除账号「${user.username}」吗？`}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(user)}
          >
            <Button danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const drawerTitle =
    drawerMode === 'create'
      ? '新建用户'
      : drawerMode === 'edit'
        ? `编辑用户 · ${activeUser?.username ?? ''}`
        : `修改密码 · ${activeUser?.username ?? ''}`

  return (
    <section className={styles.page}>
      <Card bordered={false} className={styles.panel}>
        <AdminPageHeader
          eyebrow="User CRUD"
          title="用户管理"
          actions={
            <>
              <Button
                icon={<ReloadOutlined />}
                loading={refreshing}
                onClick={() => void loadUsers({ silent: true })}
              >
                刷新
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateDrawer}
              >
                新建用户
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
        ) : users.length === 0 ? (
          <Empty description="当前还没有管理用户。" className={styles.emptyState} />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={users}
            loading={refreshing}
            pagination={false}
            scroll={{ x: 980 }}
            className={styles.table}
          />
        )}
      </Card>

      <Drawer
        title={drawerTitle}
        open={drawerOpen}
        onClose={closeDrawer}
        width={drawerMode === 'password' ? 420 : 520}
        destroyOnHidden
        extra={
          <Space>
            <Button onClick={closeDrawer}>取消</Button>
            <Button type="primary" loading={submitting} onClick={() => void handleSubmit()}>
              {drawerMode === 'create'
                ? '创建用户'
                : drawerMode === 'edit'
                  ? '保存修改'
                  : '更新密码'}
            </Button>
          </Space>
        }
      >
        {drawerMode === 'password' ? (
          <Form form={passwordForm} layout="vertical" className={styles.form}>
            <Form.Item
              label="新密码"
              name="password"
              rules={[{ required: true, message: '请输入新密码' }]}
            >
              <Input.Password placeholder="请输入新密码" />
            </Form.Item>
          </Form>
        ) : (
          <Form
            form={userForm}
            layout="vertical"
            initialValues={toUserFormValues(null)}
            className={styles.form}
          >
            <Form.Item
              label="账号"
              name="username"
              rules={[{ required: true, message: '请输入账号' }]}
            >
              <Input placeholder="admin-root" />
            </Form.Item>

            {drawerMode === 'create' ? (
              <Form.Item
                label="初始密码"
                name="password"
                rules={[{ required: true, message: '请输入初始密码' }]}
              >
                <Input.Password placeholder="请输入初始密码" />
              </Form.Item>
            ) : null}

            <Form.Item
              label="昵称"
              name="nickname"
              rules={[{ required: true, message: '请输入昵称' }]}
            >
              <Input placeholder="站点管理员" />
            </Form.Item>

            <Form.Item label="角色" name="role">
              <Segmented
                options={userRoleOptions}
                block
                className={styles.roleSegmented}
              />
            </Form.Item>

            <Form.Item
              label="启用状态"
              name="enabled"
              valuePropName="checked"
            >
              <Switch checkedChildren="启用" unCheckedChildren="停用" />
            </Form.Item>
          </Form>
        )}
      </Drawer>
    </section>
  )
}
