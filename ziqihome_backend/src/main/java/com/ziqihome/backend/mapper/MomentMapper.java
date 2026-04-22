package com.ziqihome.backend.mapper;

import com.ziqihome.backend.domain.Moment;
import com.ziqihome.backend.domain.MomentCategory;
import com.ziqihome.backend.dto.moment.MomentRequest;
import com.ziqihome.backend.dto.moment.MomentResponse;
import org.springframework.stereotype.Component;

@Component
public class MomentMapper {

  private final MomentCategoryMapper momentCategoryMapper;

  public MomentMapper(MomentCategoryMapper momentCategoryMapper) {
    this.momentCategoryMapper = momentCategoryMapper;
  }

  public MomentResponse toResponse(Moment moment) {
    return new MomentResponse(
        moment.getId(),
        moment.getContent(),
        moment.getImageUrl(),
        moment.getImageAlt(),
        momentCategoryMapper.toSummary(moment.getCategory()),
        moment.getPublished(),
        moment.getShowOnHome(),
        moment.getPinned(),
        moment.getCreatedAt(),
        moment.getUpdatedAt()
    );
  }

  public void updateEntity(Moment moment, MomentRequest request, MomentCategory category) {
    // moment 既支持纯文字也支持图文，所以图片字段允许清空，但正文和分类必须稳定存在。
    moment.setContent(request.content().trim());
    moment.setImageUrl(normalizeOptionalText(request.imageUrl()));
    moment.setImageAlt(normalizeOptionalText(request.imageAlt()));
    moment.setCategory(category);
    moment.setPublished(request.published());
    moment.setShowOnHome(request.showOnHome());
    moment.setPinned(request.pinned());
  }

  private String normalizeOptionalText(String value) {
    if (value == null) {
      return null;
    }

    String trimmedValue = value.trim();
    return trimmedValue.isEmpty() ? null : trimmedValue;
  }
}
