package com.ziqihome.backend.mapper;

import com.ziqihome.backend.domain.MomentCategory;
import com.ziqihome.backend.dto.moment.MomentCategoryRequest;
import com.ziqihome.backend.dto.moment.MomentCategoryResponse;
import com.ziqihome.backend.dto.moment.MomentCategorySummaryResponse;
import org.springframework.stereotype.Component;

@Component
public class MomentCategoryMapper {

  public MomentCategoryResponse toResponse(MomentCategory category) {
    return new MomentCategoryResponse(
        category.getId(),
        category.getName(),
        category.getCreatedAt(),
        category.getUpdatedAt()
    );
  }

  public MomentCategorySummaryResponse toSummary(MomentCategory category) {
    return new MomentCategorySummaryResponse(
        category.getId(),
        category.getName()
    );
  }

  public void updateEntity(MomentCategory category, MomentCategoryRequest request) {
    // 分类名称统一在 mapper 中做 trim，避免 service 和 controller 出现重复清洗。
    category.setName(request.name().trim());
  }
}
