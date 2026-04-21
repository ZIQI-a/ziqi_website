import {
  App as AntApp,
  Button,
  ConfigProvider,
  Layout,
  Menu,
} from 'antd'
import {
  AppstoreOutlined,
  BookOutlined,
  LinkOutlined,
  HomeOutlined,
  LeftOutlined,
} from '@ant-design/icons'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import 'antd/dist/reset.css'
import styles from './AdminLayout.module.css'
import { adminTheme } from '../theme/adminTheme'

const adminNavItems = [
  { key: '/admin', to: '/admin', label: '管理首页', icon: <HomeOutlined /> },
  { key: '/admin/blogs', to: '/admin/blogs', label: '博客管理', icon: <BookOutlined /> },
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
]

export function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()

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
              <Button
                icon={<LeftOutlined />}
                onClick={() => navigate('/')}
                className={styles.backButton}
              >
                返回公开站点
              </Button>
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
