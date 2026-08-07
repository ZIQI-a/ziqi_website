package com.ziqihome.backend.dto.blog;

import java.util.List;

/**
 * 公开博客筛选项始终基于全部已发布文章生成，避免前端筛选后选项随结果集缩减。
 */
public record BlogFilterOptionsResponse(
    List<String> categories,
    List<String> tags
) {
}
