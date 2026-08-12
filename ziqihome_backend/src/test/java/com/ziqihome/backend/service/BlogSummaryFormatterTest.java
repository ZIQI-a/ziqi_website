package com.ziqihome.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class BlogSummaryFormatterTest {

  @Test
  void shouldPreferReadableDescription() {
    String summary = BlogSummaryFormatter.fromMarkdown(
        "# 正文标题\n正文内容会作为后备摘要。",
        "这是一段用于公开列表展示的清晰文章摘要。"
    );

    assertThat(summary).isEqualTo("这是一段用于公开列表展示的清晰文章摘要。");
  }

  @Test
  void shouldFallbackToMarkdownWhenDescriptionIsTooShort() {
    String summary = BlogSummaryFormatter.fromMarkdown(
        "# 录音排查\n本文记录单声道、混音与音频映射的排查过程。",
        "无"
    );

    assertThat(summary).isEqualTo("录音排查 本文记录单声道、混音与音频映射的排查过程。");
  }

  @Test
  void shouldRemoveMarkdownLinksAndRawUrls() {
    String summary = BlogSummaryFormatter.fromMarkdown(
        "阅读[路由设计文档](https://example.com/router)，并记录可复用的页面状态方案。 https://example.com/download",
        "下载地址：https://example.com/archive.zip"
    );

    assertThat(summary)
        .isEqualTo("阅读路由设计文档，并记录可复用的页面状态方案。");
  }

  @Test
  void shouldRejectStructuredPayloadAndUseFallback() {
    String structuredPayload = "{\"format\":\"lakesheet\",\"type\":\"doc\"}";

    assertThat(BlogSummaryFormatter.fromMarkdown(structuredPayload, structuredPayload))
        .isEqualTo("这是一篇从语雀同步过来的文章，摘要正在整理中。");
  }

  @Test
  void shouldRejectTruncatedStructuredPayload() {
    String truncatedPayload = "{\"format\":\"lakesheet\",\"type\":\"Sheet\",\"version\":";

    assertThat(BlogSummaryFormatter.fromMarkdown(truncatedPayload, null))
        .isEqualTo("这是一篇从语雀同步过来的文章，摘要正在整理中。");
  }

  @Test
  void shouldLimitGeneratedSummaryLength() {
    String markdown = "内容".repeat(120);

    assertThat(BlogSummaryFormatter.fromMarkdown(markdown, null)).hasSize(180);
  }
}
