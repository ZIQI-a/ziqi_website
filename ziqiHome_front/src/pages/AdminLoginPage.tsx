import { useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Space,
  Typography,
} from 'antd'
import { LockOutlined, LoginOutlined, UserOutlined } from '@ant-design/icons'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/authStore'
import styles from './AdminLoginPage.module.css'

interface LoginFormValues {
  username: string
  password: string
}

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
  const { isAuthenticated, login } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={resolveRedirect(location.search)} replace />
  }

  async function handleSubmit() {
    setSubmitting(true)

    try {
      const values = await form.validateFields()

      // 后端登录接口尚未接入，这里先提供前端路由守卫与会话流转壳子。
      login({ username: values.username })
      navigate(resolveRedirect(location.search), { replace: true })
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
              先把后台工作台入口和路由守卫接起来，等后端登录接口完成后再替换为真实鉴权请求。
            </Typography.Paragraph>
          </div>

          <Alert
            type="warning"
            showIcon
            message="当前为前端登录壳子"
            description="目前仅维护本地会话与路由拦截，不会校验真实账号密码。后续接入后端接口后可无缝替换提交逻辑。"
            className={styles.alert}
          />

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
            <Typography.Text type="secondary">
              公开站点仍可直接访问
            </Typography.Text>
            <Link to="/" className={styles.homeLink}>
              返回首页
            </Link>
          </div>
        </Space>
      </Card>
    </section>
  )
}
