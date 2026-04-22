import {
  ArrowRightOutlined,
  BookOutlined,
  LinkOutlined,
  ProjectOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Space, Typography } from "antd";
import { Link } from "react-router-dom";
import { AdminPageHeader } from "../components/admin/AdminPageHeader";
import styles from "./AdminHomePage.module.css";

const cards = [
  {
    title: "博客管理",
    to: "/admin/blogs",
    icon: <BookOutlined />,
  },
  {
    title: "项目管理",
    to: "/admin/projects",
    icon: <ProjectOutlined />,
  },
  {
    title: "联系平台",
    to: "/admin/contact-links",
    icon: <LinkOutlined />,
  },
  {
    title: "用户管理",
    to: "/admin/users",
    icon: <UserOutlined />,
  },
];

export function AdminHomePage() {
  return (
    <section className={styles.page}>
      <AdminPageHeader eyebrow="Admin Home" title="管理首页" />

      <Row gutter={[20, 20]}>
        {cards.map((card) => (
          <Col key={card.to} xs={24} md={12} xl={8}>
            <Card className={styles.card} bordered={false}>
              <Space
                direction="vertical"
                size={18}
                className={styles.cardContent}
              >
                <div className={styles.cardIcon}>{card.icon}</div>
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
  );
}
