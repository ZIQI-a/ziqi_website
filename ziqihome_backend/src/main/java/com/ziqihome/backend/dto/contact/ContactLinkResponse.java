package com.ziqihome.backend.dto.contact;

import java.time.Instant;

public record ContactLinkResponse(
    Long id,
    String platformName,
    String profileUrl,
    String iconUrl,
    String description,
    Boolean published,
    Integer sortOrder,
    Instant createdAt,
    Instant updatedAt
) {
}
