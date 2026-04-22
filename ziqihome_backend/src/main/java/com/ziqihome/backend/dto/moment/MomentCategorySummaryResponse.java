package com.ziqihome.backend.dto.moment;

/**
 * moments 响应里只嵌入分类最小信息，避免重复返回不必要的时间字段。
 */
public record MomentCategorySummaryResponse(
    Long id,
    String name
) {
}
