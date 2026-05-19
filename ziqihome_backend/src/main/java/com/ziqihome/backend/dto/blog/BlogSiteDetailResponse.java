package com.ziqihome.backend.dto.blog;

import com.ziqihome.backend.domain.BlogContentMode;
import com.ziqihome.backend.domain.BlogSourceType;
import java.time.LocalDate;
import java.util.List;

/**
 * 公开站详情接口返回完整正文，用于本地文章详情页展示。
 */
public record BlogSiteDetailResponse(
    Long id,
    String slug,
    String title,
    LocalDate publishDate,
    String category,
    String summary,
    String cover,
    List<String> tags,
    String contentMarkdown,
    BlogContentMode contentMode,
    BlogSourceType sourceType,
    String sourceLabel,
    String sourceUrl
) {
}
