package com.ziqihome.backend.dto.blog;

import com.ziqihome.backend.domain.BlogContentMode;
import com.ziqihome.backend.domain.BlogSourceType;
import java.time.LocalDate;
import java.util.List;

/**
 * 公开站博客列表只返回摘要字段，避免整篇正文在列表场景一次性下发。
 */
public record BlogSiteSummaryResponse(
    Long id,
    String slug,
    String title,
    LocalDate publishDate,
    String category,
    String summary,
    String cover,
    List<String> tags,
    BlogContentMode contentMode,
    BlogSourceType sourceType,
    String sourceLabel,
    String sourceUrl
) {
}
