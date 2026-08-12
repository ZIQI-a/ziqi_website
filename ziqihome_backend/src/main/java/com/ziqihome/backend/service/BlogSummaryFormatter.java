package com.ziqihome.backend.service;

import java.util.regex.Pattern;

/**
 * 统一整理博客摘要，避免把原始 JSON、下载链接或无意义短文本直接带到公开卡片。
 */
final class BlogSummaryFormatter {

  private static final int MAX_SUMMARY_LENGTH = 180;
  private static final String FALLBACK_SUMMARY = "这是一篇从语雀同步过来的文章，摘要正在整理中。";
  private static final Pattern RAW_URL_PATTERN = Pattern.compile("https?://\\S+", Pattern.CASE_INSENSITIVE);
  private static final Pattern STRUCTURED_PAYLOAD_PATTERN = Pattern.compile(
      "^[\\[{]\\s*\\\"(?:format|type|larkJson|sheet|blocks?|[^\\\"]+)\\\"\\s*:",
      Pattern.CASE_INSENSITIVE | Pattern.DOTALL
  );

  private BlogSummaryFormatter() {
  }

  /**
   * 优先采用质量合格的语雀描述，否则从 Markdown 正文提取可读文本。
   */
  static String fromMarkdown(String markdown, String description) {
    String normalizedDescription = normalize(description);
    if (isUsable(normalizedDescription)) {
      return truncate(normalizedDescription);
    }

    String plainText = normalize(markdown
        .replaceAll("```[\\s\\S]*?```", " ")
        .replaceAll("`([^`]+)`", "$1")
        .replaceAll("!\\[[^\\]]*]\\([^)]*\\)", " ")
        .replaceAll("\\[([^\\]]+)]\\([^)]*\\)", "$1")
        .replaceAll("(?m)^#{1,6}\\s+", "")
        .replaceAll("(?m)^[-*+]\\s+", "")
        .replaceAll("(?m)^>\\s?", "")
        .replaceAll("[*_~]", " ")
        .replaceAll("<[^>]+>", " ")
        .replaceAll("https?://\\S+", " "));

    return isUsable(plainText) ? truncate(plainText) : FALLBACK_SUMMARY;
  }

  private static boolean isUsable(String value) {
    if (value.length() < 8) {
      return false;
    }

    if (RAW_URL_PATTERN.matcher(value).find()) {
      return false;
    }

    return !STRUCTURED_PAYLOAD_PATTERN.matcher(value).find();
  }

  private static String normalize(String value) {
    if (value == null) {
      return "";
    }

    return value
        .replaceAll("[\\p{Cc}&&[^\\n\\t]]", " ")
        .replaceAll("\\s+", " ")
        .trim();
  }

  private static String truncate(String value) {
    return value.substring(0, Math.min(value.length(), MAX_SUMMARY_LENGTH));
  }
}
