package com.ziqihome.backend.dto.moment;

import java.time.Instant;

/**
 * 公开站和管理端当前都可以复用同一份响应结构，减少重复 DTO。
 */
public record MomentResponse(
    Long id,
    String content,
    String imageUrl,
    String imageAlt,
    MomentCategorySummaryResponse category,
    Boolean published,
    Boolean showOnHome,
    Boolean pinned,
    Instant createdAt,
    Instant updatedAt
) {
}
