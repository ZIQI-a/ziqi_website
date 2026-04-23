import {
  App as AntApp,
  Button,
  ConfigProvider,
  Layout,
  Menu,
  Space,
  Typography,
} from 'antd'
import {
  AppstoreOutlined,
  BookOutlined,
  CameraOutlined,
  LinkOutlined,
  HomeOutlined,
  LeftOutlined,
  LockOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import 'antd/dist/reset.css'
import styles from './AdminLayout.module.css'
import { adminTheme } from '../../theme/adminTheme'
import { useAuth } from '../../auth/authStore'

const adminNavItems = [
  { key: '/admin', to: '/admin', label: '管理首页', icon: <HomeOutlined /> },
  { key: '/admin/blogs', to: '/admin/blogs', label: '博客管理', icon: <BookOutlined /> },
  {
    key: '/admin/moments',
    to: '/admin/moments',
    label: '动态管理',
    icon: <CameraOutlined />,
  },
  {
    key: '/admin/projects',
    to: '/admin/projects',
    label: '项目管理',
    icon: <AppstoreOutlined />,
  },
  {
    key: '/admin/contact-links',
    to: '/admin/contact-links',
    label: '联系平台',
    icon: <LinkOutlined />,
  },
  {
    key: '/admin/users',
    to: '/admin/users',
    label: '用户管理',
    icon: <UserOutlined />,
  },
]

export function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, logout } = useAuth()

  return (
    <ConfigProvider theme={adminTheme}>
      <AntApp>
        <Layout className={styles.shell}>
          <header className={styles.header}>
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              className={styles.topNav}
              items={adminNavItems.map((item) => ({
                key: item.key,
                icon: item.icon,
                label: item.label,
                onClick: () => navigate(item.to),
              }))}
            />

            <div className={styles.toolbar}>
              <Space size={12} wrap>
                {session ? (
                  <div className={styles.identityCard}>
                    <div className={styles.identityIcon}>
                      <LockOutlined />
                    </div>
                    <div className={styles.identityMeta}>
                      <Typography.Text className={styles.identityTitle}>
                        当前会话
                      </Typography.Text>
                      <Typography.Text className={styles.identityName}>
                        {session.nickname}
                      </Typography.Text>
                    </div>
                  </div>
                ) : null}

                <Button
                  icon={<LogoutOutlined />}
                  onClick={() => {
                    logout()
                    navigate('/admin/login')
                  }}
                >
                  退出
                </Button>

                <Button
                  icon={<LeftOutlined />}
                  onClick={() => navigate('/')}
                  className={styles.backButton}
                >
                  返回公开站点
                </Button>
              </Space>
            </div>
          </header>

          <main className={styles.main}>
            <Outlet />
          </main>
        </Layout>
      </AntApp>
    </ConfigProvider>
  )
}
