import type { BlogPostSummary } from "../types/content";

export type BlogSummaryQuality =
  | "ready"
  | "too-short"
  | "too-long"
  | "structured"
  | "link-heavy";

export const BLOG_SUMMARY_FALLBACK =
  "文章摘要正在整理，正文内容仍可正常阅读。";

const DEFAULT_BLOG_COVER_PATH = "/mywebsite/image/time3.jpg";
const RAW_URL_PATTERN = /https?:\/\/\S+/i;
const STRUCTURED_PAYLOAD_PATTERN =
  /^[{[]\s*"(?:format|type|larkJson|sheet|blocks?|[^"]+)"\s*:/i;

/** 统一空白和控制字符，确保摘要在公开卡片与后台表格中稳定展示。 */
export function normalizeBlogSummary(summary: string) {
  const printableText = Array.from(summary, (character) => {
    const code = character.charCodeAt(0);
    const isUnsupportedControl =
      (code >= 0 && code <= 8) ||
      code === 11 ||
      code === 12 ||
      (code >= 14 && code <= 31) ||
      code === 127;
    return isUnsupportedControl ? " " : character;
  }).join("");

  return printableText.replace(/\s+/g, " ").trim();
}

/** 对摘要做轻量内容体检；后台使用结果提示维护者，不阻断历史数据编辑。 */
export function getBlogSummaryQuality(summary: string): BlogSummaryQuality {
  const normalized = normalizeBlogSummary(summary);

  if (normalized.length < 12) {
    return "too-short";
  }

  if (STRUCTURED_PAYLOAD_PATTERN.test(normalized)) {
    return "structured";
  }

  if (RAW_URL_PATTERN.test(normalized)) {
    return "link-heavy";
  }

  if (normalized.length > 180) {
    return "too-long";
  }

  return "ready";
}

/** 公开列表只替换明显无效的摘要；较长但可读的文本继续交给卡片行数限制处理。 */
export function getBlogSummaryPresentation(summary: string) {
  const normalized = normalizeBlogSummary(summary);
  const quality = getBlogSummaryQuality(normalized);
  const shouldFallback = ["too-short", "structured", "link-heavy"].includes(quality);

  return {
    text: shouldFallback ? BLOG_SUMMARY_FALLBACK : normalized,
    isFallback: shouldFallback,
    quality,
  };
}

export function getBlogSummaryQualityLabel(quality: BlogSummaryQuality) {
  const labels: Record<BlogSummaryQuality, string> = {
    ready: "摘要正常",
    "too-short": "内容过短",
    "too-long": "内容偏长",
    structured: "疑似原始数据",
    "link-heavy": "包含原始链接",
  };

  return labels[quality];
}

/** 从 Markdown 提取干净文本，供新文章和低质量历史摘要在再次保存时生成摘要。 */
export function extractBlogSummaryFromMarkdown(markdown: string) {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_~]/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/https?:\/\/\S+/g, " ");

  const candidate = normalizeBlogSummary(plainText).slice(0, 160);
  const quality = getBlogSummaryQuality(candidate);

  return quality === "ready" || quality === "too-long"
    ? candidate
    : BLOG_SUMMARY_FALLBACK;
}

/** 基于 slug 生成稳定的编辑编号与兜底渐变，让重复默认封面仍有文章辨识度。 */
export function getBlogVisualIdentity(post: BlogPostSummary) {
  const hash = Array.from(post.slug).reduce(
    (total, character) => (total * 31 + character.charCodeAt(0)) >>> 0,
    17,
  );
  const issue = String((hash % 89) + 10).padStart(2, "0");
  const hue = 205 + (hash % 36);

  return {
    code: `NO.${issue}`,
    gradient: `linear-gradient(145deg, hsl(${hue} 48% 18%), hsl(${hue + 24} 56% 8%) 68%, hsl(39 72% 28%))`,
  };
}

export function isDefaultBlogCover(cover: string) {
  return cover.includes(DEFAULT_BLOG_COVER_PATH);
}
