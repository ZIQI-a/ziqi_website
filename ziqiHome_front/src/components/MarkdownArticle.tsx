import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./MarkdownArticle.module.css";

interface MarkdownArticleProps {
  markdown: string;
}

/**
 * 从标题文本生成 HTML 锚点 id。
 * 中文和英文都保留，空格和非字母数字转为连字符，保持与 TOC 提取时的 id 规则一致。
 */
function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fff-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * 从 react-markdown 的 children 中提取纯文本，用于生成 id。
 */
function textFromChildren(children: React.ReactNode) {
  return React.Children.toArray(children)
    .map((child) => (typeof child === "string" ? child : ""))
    .join("");
}

/**
 * 统一封装 Markdown 渲染配置，保证后台预览和前台详情页的展示规则一致。
 */
export function MarkdownArticle({ markdown }: MarkdownArticleProps) {
  return (
    <div className={styles.article}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children, ...props }) => {
            const text = textFromChildren(children);
            const id = slugifyHeading(text);
            return (
              <h1 id={id} {...props}>
                {children}
              </h1>
            );
          },
          h2: ({ children, ...props }) => {
            const text = textFromChildren(children);
            const id = slugifyHeading(text);
            return (
              <h2 id={id} {...props}>
                {children}
              </h2>
            );
          },
          h3: ({ children, ...props }) => {
            const text = textFromChildren(children);
            const id = slugifyHeading(text);
            return (
              <h3 id={id} {...props}>
                {children}
              </h3>
            );
          },
          /**
           * 语雀 CDN 图片对网页 Referer 有防盗链限制，这里主动去掉 Referer，
           * 避免站内展示语雀外链图片时被 403 拦截。
           */
          img: ({ src, alt }) => (
            <img
              src={src ?? ""}
              alt={alt ?? ""}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
