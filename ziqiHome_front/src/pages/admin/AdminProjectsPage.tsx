import { useEffect, useState } from "react";
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
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { ApiError, adminClient } from "../../api/adminClient";
import type {
  ProjectAdminItem,
  ProjectAdminPayload,
  ProjectFormOptions,
  ProjectStatus,
} from "../../types/admin";
import styles from "./AdminProjectsPage.module.css";

const { TextArea } = Input;

const emptyForm: ProjectAdminPayload = {
  slug: "",
  name: "",
  description: "",
  status: "",
  cover: "",
  link: "",
  stack: [],
  highlights: [],
  published: true,
  sortOrder: 0,
};

interface ProjectFormValues {
  slug: string;
  name: string;
  description: string;
  status: ProjectStatus;
  cover: string;
  link: string;
  stack: string[];
  highlights: string;
  published: boolean;
  sortOrder: number;
}

function formatListInput(values: string[]) {
  return values.join("\n");
}

function parseListInput(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toFormValues(project: ProjectAdminItem | null): ProjectFormValues {
  const source = project
    ? {
        ...project,
        link: project.link ?? "",
      }
    : emptyForm;

  return {
    slug: source.slug,
    name: source.name,
    description: source.description,
    status: source.status,
    cover: source.cover,
    link: source.link,
    stack: source.stack,
    highlights: formatListInput(source.highlights),
    published: source.published,
    sortOrder: source.sortOrder,
  };
}

/**
 * 把抽屉表单值还原成后端 DTO，继续保持管理页字段与接口模型一一对应。
 */
function toPayload(values: ProjectFormValues): ProjectAdminPayload {
  return {
    slug: values.slug.trim(),
    name: values.name.trim(),
    description: values.description.trim(),
    status: values.status,
    cover: values.cover.trim(),
    link: values.link.trim(),
    // Select 的 tags 模式允许选择已有项，也允许直接录入新技术栈。
    stack: values.stack
      .map((item) => item.trim())
      .filter(Boolean),
    highlights: parseListInput(values.highlights),
    published: values.published,
    sortOrder: values.sortOrder,
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "请求失败，请稍后重试";
}

export function AdminProjectsPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<ProjectFormValues>();
  const [projects, setProjects] = useState<ProjectAdminItem[]>([]);
  const [formOptions, setFormOptions] = useState<ProjectFormOptions>({
    statusOptions: [],
    stackOptions: [],
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectAdminItem | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadProjects();
    void loadProjectFormOptions();
  }, []);

  async function loadProjects(options?: { silent?: boolean }) {
    const silent = options?.silent ?? false;

    if (silent) {
      setRefreshing(true);
    } else {
      setInitialLoading(true);
    }

    setError(null);

    try {
      const data = await adminClient.listProjects();
      setProjects(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setInitialLoading(false);
      }
    }
  }

  async function loadProjectFormOptions() {
    setOptionsLoading(true);

    try {
      const data = await adminClient.getProjectFormOptions();
      setFormOptions(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setOptionsLoading(false);
    }
  }

  function getDefaultStatus() {
    return formOptions.statusOptions[0] ?? "";
  }

  function openCreateDrawer() {
    setEditingProject(null);
    form.resetFields();
    form.setFieldsValue({
      ...toFormValues(null),
      status: getDefaultStatus(),
    });
    setDrawerOpen(true);
  }

  function openEditDrawer(project: ProjectAdminItem) {
    setEditingProject(project);
    form.resetFields();
    form.setFieldsValue(toFormValues(project));
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingProject(null);
    form.resetFields();
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      const values = await form.validateFields();
      const payload = toPayload(values);

      if (editingProject === null) {
        await adminClient.createProject(payload);
        message.success("项目创建成功。");
      } else {
        await adminClient.updateProject(editingProject.id, payload);
        message.success("项目更新成功。");
      }

      closeDrawer();
      await Promise.all([loadProjects({ silent: true }), loadProjectFormOptions()]);
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        if (submitError.fieldErrors) {
          form.setFields(
            Object.entries(submitError.fieldErrors).map(([name, errors]) => ({
              name: name as keyof ProjectFormValues,
              errors: [errors],
            })),
          );
        }
        setError(submitError.message);
        return;
      }

      if ((submitError as { errorFields?: unknown[] }).errorFields) {
        return;
      }

      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(project: ProjectAdminItem) {
    setError(null);

    try {
      await adminClient.deleteProject(project.id);
      if (editingProject?.id === project.id) {
        closeDrawer();
      }
      message.success(`项目「${project.name}」已删除。`);
      await loadProjects({ silent: true });
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  }

  const columns: ColumnsType<ProjectAdminItem> = [
    {
      title: "项目",
      dataIndex: "name",
      key: "name",
      render: (_, project) => (
        <div className={styles.projectCell}>
          <Typography.Text strong>{project.name}</Typography.Text>
          <Typography.Text type="secondary">{project.slug}</Typography.Text>
        </div>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: ProjectStatus) => (
        <Tag bordered={false} className={styles.statusTag}>
          {status}
        </Tag>
      ),
    },
    {
      title: "技术栈",
      dataIndex: "stack",
      key: "stack",
      render: (stack: string[]) => (
        <Space size={[8, 8]} wrap>
          {stack.slice(0, 3).map((item) => (
            <Tag key={item} bordered={false} className={styles.stackTag}>
              {item}
            </Tag>
          ))}
          {stack.length > 3 ? (
            <Typography.Text type="secondary">
              +{stack.length - 3}
            </Typography.Text>
          ) : null}
        </Space>
      ),
    },
    {
      title: "排序",
      dataIndex: "sortOrder",
      key: "sortOrder",
      width: 96,
    },
    {
      title: "发布",
      dataIndex: "published",
      key: "published",
      width: 120,
      render: (published: boolean) =>
        published ? (
          <Tag color="gold" bordered={false}>
            公开可见
          </Tag>
        ) : (
          <Tag bordered={false}>暂不发布</Tag>
        ),
    },
    {
      title: "操作",
      key: "actions",
      width: 168,
      render: (_, project) => (
        <Space size={8}>
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditDrawer(project)}
          >
            编辑
          </Button>
          <Popconfirm
            overlayClassName={styles.deleteConfirm}
            title={`确认删除项目「${project.name}」吗？`}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(project)}
          >
            <Button danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <section className={styles.page}>
      <Card bordered={false} className={styles.panel}>
        <AdminPageHeader
          eyebrow="Project CRUD"
          title="项目管理"
          actions={
            <>
              <Button
                icon={<ReloadOutlined />}
                loading={refreshing}
                onClick={() => void loadProjects({ silent: true })}
              >
                刷新
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateDrawer}
              >
                新建项目
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
        ) : projects.length === 0 ? (
          <Empty
            description="当前还没有项目记录。"
            className={styles.emptyState}
          />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={projects}
            loading={refreshing}
            pagination={false}
            scroll={{ x: 920 }}
            className={styles.table}
          />
        )}
      </Card>

      <Drawer
        title={
          editingProject === null
            ? "新建项目"
            : `编辑项目 · ${editingProject.name}`
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
              {editingProject === null ? "创建项目" : "保存修改"}
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
            label="slug"
            name="slug"
            rules={[
              { required: true, message: "请输入 slug" },
              {
                pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                message: "仅支持小写字母、数字和单个连字符",
              },
            ]}
            extra="作为项目稳定标识，保存后仍可修改，但不能与现有项目重复。"
          >
            <Input placeholder="personal-archive-admin" />
          </Form.Item>

          <Form.Item
            label="项目名称"
            name="name"
            rules={[{ required: true, message: "请输入项目名称" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: "请选择项目状态" }]}
          >
            <Select
              loading={optionsLoading}
              options={formOptions.statusOptions.map((status) => ({
                label: status,
                value: status,
              }))}
            />
          </Form.Item>

          <Typography.Paragraph type="secondary" className={styles.stageHint}>
            状态只表示项目阶段；是否在公开站展示由下方发布开关单独控制。
          </Typography.Paragraph>

          <Form.Item
            label="排序值"
            name="sortOrder"
            rules={[
              { required: true, message: "请输入排序值" },
              { type: "number", min: 0, message: "排序值不能小于 0" },
            ]}
            extra="数值越小越靠前，相同数值按较新记录优先。"
          >
            <InputNumber min={0} precision={0} className={styles.fullControl} />
          </Form.Item>

          <Form.Item
            label="封面 URL"
            name="cover"
            rules={[
              { required: true, message: "请输入封面地址" },
              { type: "url", message: "请输入有效的 URL" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="项目链接"
            name="link"
            rules={[
              { type: "url", message: "请输入有效的 URL" },
            ]}
            extra="可为空，留空时前台不展示跳转链接。"
          >
            <Input placeholder="https://example.com" />
          </Form.Item>

          <Form.Item
            label="项目描述"
            name="description"
            rules={[{ required: true, message: "请输入项目描述" }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="技术栈"
            name="stack"
            rules={[{ required: true, message: "请至少填写一项技术栈" }]}
            extra="可直接选择已有技术栈，也可输入新项后回车创建。"
          >
            <Select
              mode="tags"
              loading={optionsLoading}
              placeholder="选择或输入技术栈，例如 React、TypeScript"
              options={formOptions.stackOptions.map((item) => ({
                label: item,
                value: item,
              }))}
              tokenSeparators={[",", "，"]}
            />
          </Form.Item>

          <Form.Item
            label="项目亮点"
            name="highlights"
            rules={[{ required: true, message: "请至少填写一条项目亮点" }]}
            extra="一行一个，便于与后端 highlights 子表对齐。"
          >
            <TextArea
              rows={5}
              placeholder={"路由组织\n组件拆分\n数据驱动渲染"}
            />
          </Form.Item>

          <Form.Item label="发布状态" name="published" valuePropName="checked">
            <Switch checkedChildren="已发布" unCheckedChildren="未发布" />
          </Form.Item>
        </Form>
      </Drawer>
    </section>
  );
}
