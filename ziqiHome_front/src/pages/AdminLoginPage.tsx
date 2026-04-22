import { useState } from 'react'
import {
  Button,
  Card,
  Form,
  Input,
  Space,
  Typography,
} from 'antd'
import { LockOutlined, LoginOutlined, UserOutlined } from '@ant-design/icons'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthApiError } from '../api/authClient'
import { useAuth } from '../auth/authStore'
import styles from './AdminLoginPage.module.css'

interface LoginFormValues {
  username: string
  password: string
}

/**
 * 登录成功后优先回到用户原本要进入的后台路由，减少被守卫打断后的跳转损耗。
 */
function resolveRedirect(search: string) {
  const params = new URLSearchParams(search)
  const redirect = params.get('redirect')

  if (!redirect || !redirect.startsWith('/admin')) {
    return '/admin'
  }

  return redirect
}

export function AdminLoginPage() {
  const [form] = Form.useForm<LoginFormValues>()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isInitializing, login } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isInitializing && isAuthenticated) {
    return <Navigate to={resolveRedirect(location.search)} replace />
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    try {
      const values = await form.validateFields()
      await login(values)
      navigate(resolveRedirect(location.search), { replace: true })
    } catch (submitError) {
      if (submitError instanceof AuthApiError) {
        if (submitError.fieldErrors) {
          form.setFields(
            Object.entries(submitError.fieldErrors).map(([name, errors]) => ({
              name: name as keyof LoginFormValues,
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

      setError(submitError instanceof Error ? submitError.message : '登录失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.backgroundHalo} />

      <Card bordered={false} className={styles.card}>
        <Space direction="vertical" size={18} className={styles.content}>
          <div className={styles.badge}>Admin Gateway</div>

          <div className={styles.heading}>
            <Typography.Title level={1} className={styles.title}>
              登录管理后台
            </Typography.Title>
            <Typography.Paragraph className={styles.subtitle}>
              输入后台账号和密码后进入管理工作台。
            </Typography.Paragraph>
          </div>

          {error ? (
            <Typography.Paragraph className={styles.errorText}>
              {error}
            </Typography.Paragraph>
          ) : null}

          <Form form={form} layout="vertical" className={styles.form}>
            <Form.Item
              label="账号"
              name="username"
              rules={[{ required: true, message: '请输入管理账号' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入管理账号"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入登录密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入登录密码"
                autoComplete="current-password"
              />
            </Form.Item>

            <Button
              type="primary"
              size="large"
              icon={<LoginOutlined />}
              iconPosition="end"
              loading={submitting}
              onClick={() => void handleSubmit()}
              className={styles.submitButton}
            >
              进入管理台
            </Button>
          </Form>

          <div className={styles.footer}>
            <Link to="/" className={styles.homeLink}>
              返回首页
            </Link>
          </div>
        </Space>
      </Card>
    </section>
  )
}
