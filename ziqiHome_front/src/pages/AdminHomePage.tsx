import { ArrowRightOutlined, BookOutlined, ProjectOutlined } from '@ant-design/icons'
import { Button, Card, Col, Row, Space, Tag, Typography } from 'antd'
import { Link } from 'react-router-dom'
import { AdminPageHeader } from '../components/admin/AdminPageHeader'
import styles from './AdminHomePage.module.css'

const cards = [
  {
    title: '博客管理',
    to: '/admin/blogs',
    icon: <BookOutlined />,
    accent: '内容编排',
  },
  {
    title: '项目管理',
    to: '/admin/projects',
    icon: <ProjectOutlined />,
    accent: '作品维护',
  },
]

export function AdminHomePage() {
  return (
    <section className={styles.page}>
      <AdminPageHeader eyebrow="Admin Home" title="管理首页" />

      <Row gutter={[20, 20]}>
        {cards.map((card) => (
          <Col key={card.to} xs={24} md={12}>
            <Card className={styles.card} bordered={false}>
              <Space direction="vertical" size={18} className={styles.cardContent}>
                <div className={styles.cardIcon}>{card.icon}</div>
                <Tag bordered={false} className={styles.cardTag}>
                  {card.accent}
                </Tag>
                <Typography.Title level={3} className={styles.cardTitle}>
                  {card.title}
                </Typography.Title>
                <Link to={card.to} className={styles.cardLink}>
                  <Button
                    type="primary"
                    icon={<ArrowRightOutlined />}
                    iconPosition="end"
                  >
                    进入管理
                  </Button>
                </Link>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  )
}
