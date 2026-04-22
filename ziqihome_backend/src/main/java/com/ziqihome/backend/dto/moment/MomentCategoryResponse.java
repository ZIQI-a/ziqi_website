package com.ziqihome.backend.dto.moment;

import java.time.Instant;

/**
 * 分类管理页需要完整的时间字段，便于后续做后台表格展示。
 */
public record MomentCategoryResponse(
    Long id,
    String name,
    Instant createdAt,
    Instant updatedAt
) {
}
