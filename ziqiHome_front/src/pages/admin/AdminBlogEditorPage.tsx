import { useEffect, useMemo, useRef, useState } from "react";
import { App, Button, Card, Dropdown, Input, Spin, Typography } from "antd";
import {
  ArrowLeftOutlined,
  BoldOutlined,
  CodeOutlined,
  EyeOutlined,
  FontSizeOutlined,
  ItalicOutlined,
  LinkOutlined,
  MessageOutlined,
  OrderedListOutlined,
  PictureOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
  SaveOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import type { TextAreaRef } from "antd/es/input/TextArea";
import { useNavigate, useParams } from "react-router-dom";
import { adminClient, ApiError } from "../../api/adminClient";
import { MarkdownArticle } from "../../components/MarkdownArticle";
import type { BlogAdminItem, BlogAdminPayload } from "../../types/admin";
import styles from "./AdminBlogEditorPage.module.css";

const { TextArea } = Input;

const DEFAULT_BLOG_COVER =
  "https://myphoto-1307175277.cos.ap-chengdu.myqcloud.com/mywebsite/image/time3.jpg";

interface EditorDraft {
  title: string;
  contentMarkdown: string;
}

const HEADING_LEVELS = [
  { key: "h1", label: "一级标题", prefix: "# ", fallbackSelection: "一级标题" },
  {
    key: "h2",
    label: "二级标题",
    prefix: "## ",
    fallbackSelection: "二级标题",
  },
  {
    key: "h3",
    label: "三级标题",
    prefix: "### ",
    fallbackSelection: "三级标题",
  },
  {
    key: "h4",
    label: "四级标题",
    prefix: "#### ",
    fallbackSelection: "四级标题",
  },
];

function slugify(value: string) {
  const ascii = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return ascii || `blog-${Date.now()}`;
}

/**
 * 从 Markdown 中提取摘要，保证新建草稿时即使没填摘要也有可用的默认内容。
 */
function extractSummary(markdown: string) {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_>~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return plainText.slice(0, 160) || "这是一篇新建中的文章。";
}

function buildPayload(
  draft: EditorDraft,
  existingBlog: BlogAdminItem | null,
  published: boolean,
): BlogAdminPayload {
  const normalizedTitle = draft.title.trim();
  const normalizedContent = draft.contentMarkdown.trim();

  if (existingBlog) {
    return {
      ...existingBlog,
      title: normalizedTitle,
      contentMarkdown: normalizedContent,
      summary: existingBlog.summary.trim() || extractSummary(normalizedContent),
      published,
    };
  }

  return {
    slug: slugify(normalizedTitle),
    title: normalizedTitle,
    publishDate: new Date().toISOString().slice(0, 10),
    category: "未分类",
    summary: extractSummary(normalizedContent),
    cover: DEFAULT_BLOG_COVER,
    contentMarkdown: normalizedContent,
    tags: ["待整理"],
    contentMode: "LOCAL",
    sourceType: "ORIGINAL",
    sourceLabel: null,
    sourceUrl: null,
    published,
    sortOrder: 0,
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "保存失败，请稍后重试";
}

export function AdminBlogEditorPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  const textareaRef = useRef<TextAreaRef>(null);
  const previewBodyRef = useRef<HTMLDivElement | null>(null);
  const syncSourceRef = useRef<"editor" | "preview" | null>(null);
  const [draft, setDraft] = useState<EditorDraft>({
    title: "",
    contentMarkdown: "",
  });
  const [existingBlog, setExistingBlog] = useState<BlogAdminItem | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    async function loadBlog() {
      setLoading(true);
      setError(null);

      try {
        const data = await adminClient.getBlog(Number(id));
        setExistingBlog(data);
        setDraft({
          title: data.title,
          contentMarkdown: data.contentMarkdown,
        });
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      } finally {
        setLoading(false);
      }
    }

    void loadBlog();
  }, [id]);

  function updateDraft(patch: Partial<EditorDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  /**
   * 用统一的选区写入逻辑处理 Markdown 包裹和片段插入，避免不同按钮各自维护光标行为。
   */
  function applySelectionTransform(
    transform: (selectedText: string) => {
      insertion: string;
      selectionStartOffset?: number;
      selectionEndOffset?: number;
    },
    fallbackSelection = "",
  ) {
    const textarea = textareaRef.current?.resizableTextArea?.textArea;

    if (!textarea) {
      const selectedText = fallbackSelection;
      const { insertion } = transform(selectedText);
      updateDraft({
        contentMarkdown: `${draft.contentMarkdown}${draft.contentMarkdown ? "\n" : ""}${insertion}`,
      });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText =
      draft.contentMarkdown.slice(start, end) || fallbackSelection;
    const {
      insertion,
      selectionStartOffset = insertion.length,
      selectionEndOffset = insertion.length,
    } = transform(selectedText);
    const nextMarkdown =
      draft.contentMarkdown.slice(0, start) +
      insertion +
      draft.contentMarkdown.slice(end);

    updateDraft({ contentMarkdown: nextMarkdown });

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + selectionStartOffset,
        start + selectionEndOffset,
      );
    });
  }

  function wrapSelection(
    prefix: string,
    suffix = prefix,
    fallbackSelection = "",
  ) {
    applySelectionTransform((selectedText) => {
      const resolvedSelection = selectedText || fallbackSelection;
      return {
        insertion: `${prefix}${resolvedSelection}${suffix}`,
        selectionStartOffset: prefix.length,
        selectionEndOffset: prefix.length + resolvedSelection.length,
      };
    }, fallbackSelection);
  }

  /**
   * 用于插入整段 Markdown 结构，适合标题、列表、代码块等块级内容。
   */
  function insertBlock(
    blockBuilder: (selectedText: string) => string,
    fallbackSelection = "",
  ) {
    applySelectionTransform(
      (selectedText) => ({
        insertion: blockBuilder(selectedText || fallbackSelection),
      }),
      fallbackSelection,
    );
  }

  function insertHeading(prefix: string, fallbackSelection: string) {
    insertBlock(
      (selectedText) => `\n${prefix}${selectedText}\n`,
      fallbackSelection,
    );
  }

  /**
   * 双栏编辑时按滚动比例同步两个面板，保证正文和预览大致处于对应位置。
   */
  function syncPaneScroll(source: "editor" | "preview") {
    const textarea = textareaRef.current?.resizableTextArea?.textArea;
    const previewBody = previewBodyRef.current;

    if (!textarea || !previewBody) {
      return;
    }

    if (syncSourceRef.current && syncSourceRef.current !== source) {
      return;
    }

    syncSourceRef.current = source;
    const fromElement = source === "editor" ? textarea : previewBody;
    const targetElement = source === "editor" ? previewBody : textarea;
    const maxScrollTop = fromElement.scrollHeight - fromElement.clientHeight;
    const scrollRatio =
      maxScrollTop > 0 ? fromElement.scrollTop / maxScrollTop : 0;
    const targetMaxScrollTop =
      targetElement.scrollHeight - targetElement.clientHeight;

    targetElement.scrollTop =
      targetMaxScrollTop > 0 ? targetMaxScrollTop * scrollRatio : 0;

    requestAnimationFrame(() => {
      syncSourceRef.current = null;
    });
  }

  async function saveDraft(published: boolean) {
    const normalizedTitle = draft.title.trim();
    const normalizedContent = draft.contentMarkdown.trim();

    if (!normalizedTitle) {
      setError("请输入文章标题");
      return;
    }

    if (!normalizedContent) {
      setError("请输入文章正文");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = buildPayload(draft, existingBlog, published);
      const saved = existingBlog
        ? await adminClient.updateBlog(existingBlog.id, payload)
        : await adminClient.createBlog(payload);

      setExistingBlog(saved);
      if (!id) {
        navigate(`/admin/blogs/${saved.id}/editor`, { replace: true });
      }

      message.success(published ? "文章已发布。" : "草稿已保存。");
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  const wordCount = useMemo(() => {
    return draft.contentMarkdown.replace(/\s+/g, "").length;
  }, [draft.contentMarkdown]);

  const toolbarActions = [
    {
      label: "加粗",
      icon: <BoldOutlined />,
      handler: () => wrapSelection("**", "**", "重点内容"),
    },
    {
      label: "斜体",
      icon: <ItalicOutlined />,
      handler: () => wrapSelection("*", "*", "斜体内容"),
    },
    {
      label: "删除线",
      icon: <StrikethroughOutlined />,
      handler: () => wrapSelection("~~", "~~", "删除线内容"),
    },
    {
      label: "行内代码",
      icon: <CodeOutlined />,
      handler: () => wrapSelection("`", "`", "inlineCode"),
    },
    {
      label: "引用",
      icon: <MessageOutlined />,
      handler: () =>
        insertBlock((selectedText) => `\n> ${selectedText}\n`, "引用内容"),
    },
    {
      label: "无序列表",
      icon: <UnorderedListOutlined />,
      handler: () =>
        insertBlock((selectedText) => `\n- ${selectedText}\n`, "列表项"),
    },
    {
      label: "有序列表",
      icon: <OrderedListOutlined />,
      handler: () =>
        insertBlock((selectedText) => `\n1. ${selectedText}\n`, "列表项"),
    },
    {
      label: "代码块",
      icon: <FontSizeOutlined />,
      handler: () =>
        insertBlock(
          (selectedText) => `\n\`\`\`ts\n${selectedText}\n\`\`\`\n`,
          'console.log("hello")',
        ),
    },
    {
      label: "链接",
      icon: <LinkOutlined />,
      handler: () => wrapSelection("[", "](https://example.com)", "链接文本"),
    },
    {
      label: "图片",
      icon: <PictureOutlined />,
      handler: () =>
        insertBlock(
          (selectedText) => `![${selectedText}](https://example.com/image.png)`,
          "图片描述",
        ),
    },
    {
      label: "下划线标记",
      icon: <UnderlineOutlined />,
      handler: () => wrapSelection("<u>", "</u>", "强调内容"),
    },
  ];

  if (loading) {
    return (
      <section className={styles.loadingState}>
        <Spin size="large" />
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <Card bordered={false} className={styles.shell}>
        <header className={styles.header}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/blogs")}
          >
            返回列表
          </Button>

          <Input
            value={draft.title}
            onChange={(event) => updateDraft({ title: event.target.value })}
            placeholder="请输入文章标题（5~100字）"
            maxLength={100}
            className={styles.titleInput}
          />

          <div className={styles.headerActions}>
            <Typography.Text type="secondary">
              {draft.title.trim().length}/100
            </Typography.Text>
            <Typography.Text type="secondary">
              正文 {wordCount} 字
            </Typography.Text>
            <Button
              icon={<SaveOutlined />}
              loading={saving}
              onClick={() => void saveDraft(false)}
            >
              保存草稿
            </Button>
            <Button
              type="primary"
              icon={<EyeOutlined />}
              loading={saving}
              onClick={() => void saveDraft(true)}
            >
              发布文章
            </Button>
          </div>
        </header>

        <div className={styles.toolbar}>
          <Dropdown
            menu={{
              items: HEADING_LEVELS.map((level) => ({
                key: level.key,
                label: level.label,
                onClick: () =>
                  insertHeading(level.prefix, level.fallbackSelection),
              })),
            }}
            trigger={["click"]}
          >
            <Button
              icon={<FontSizeOutlined />}
              className={styles.headingButton}
            >
              标题
            </Button>
          </Dropdown>

          {toolbarActions.map((action) => (
            <Button
              key={action.label}
              icon={action.icon}
              onClick={action.handler}
            >
              {action.label}
            </Button>
          ))}
        </div>

        {error ? (
          <Typography.Paragraph className={styles.errorText}>
            {error}
          </Typography.Paragraph>
        ) : null}

        <div className={styles.workspace}>
          <div className={styles.editorPane}>
            <TextArea
              ref={textareaRef}
              autoSize={false}
              value={draft.contentMarkdown}
              onChange={(event) =>
                updateDraft({ contentMarkdown: event.target.value })
              }
              onScroll={() => syncPaneScroll("editor")}
              placeholder="在这里输入 Markdown 正文..."
              className={styles.editor}
            />
          </div>

          <div className={styles.previewPane}>
            <div
              ref={previewBodyRef}
              className={styles.previewBody}
              onScroll={() => syncPaneScroll("preview")}
            >
              <MarkdownArticle markdown={draft.contentMarkdown || " "} />
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
