package com.ziqihome.backend.dto.blog;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record BlogPostResponse(
    Long id,
    String slug,
    String title,
    LocalDate publishDate,
    String category,
    String summary,
    String cover,
    List<String> tags,
    Boolean published,
    Integer sortOrder,
    Instant createdAt,
    Instant updatedAt
) {
}
