package com.ziqihome.backend.dto.project;

import com.ziqihome.backend.domain.ProjectStatus;
import java.util.List;

/**
 * 公开项目页只返回卡片展示所需字段，避免暴露排序值、发布状态和后台维护信息。
 */
public record ProjectSiteSummaryResponse(
    String slug,
    String name,
    String description,
    ProjectStatus status,
    String cover,
    String link,
    List<String> stack
) {
}
