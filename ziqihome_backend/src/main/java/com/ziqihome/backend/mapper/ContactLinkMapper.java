package com.ziqihome.backend.mapper;

import com.ziqihome.backend.domain.ContactLink;
import com.ziqihome.backend.dto.contact.ContactLinkRequest;
import com.ziqihome.backend.dto.contact.ContactLinkResponse;
import org.springframework.stereotype.Component;

@Component
public class ContactLinkMapper {

  public ContactLinkResponse toResponse(ContactLink contactLink) {
    return new ContactLinkResponse(
        contactLink.getId(),
        contactLink.getPlatformName(),
        contactLink.getProfileUrl(),
        contactLink.getIconUrl(),
        contactLink.getDescription(),
        contactLink.getPublished(),
        contactLink.getSortOrder(),
        contactLink.getCreatedAt(),
        contactLink.getUpdatedAt()
    );
  }

  public void updateEntity(ContactLink contactLink, ContactLinkRequest request) {
    // 联系方式字段较少，统一在 mapper 中做清洗和搬运，避免后续控制器或 service 出现重复赋值。
    contactLink.setPlatformName(request.platformName().trim());
    contactLink.setProfileUrl(request.profileUrl().trim());
    contactLink.setIconUrl(request.iconUrl().trim());
    contactLink.setDescription(request.description().trim());
    contactLink.setPublished(request.published());
    contactLink.setSortOrder(request.sortOrder());
  }
}
