package com.ziqihome.backend.dto.project;

import java.util.List;

/** 公开项目筛选项来自已发布数据，确保筛选按钮不会指向空状态。 */
public record ProjectSiteFilterOptionsResponse(
    List<String> statuses
) {
}
