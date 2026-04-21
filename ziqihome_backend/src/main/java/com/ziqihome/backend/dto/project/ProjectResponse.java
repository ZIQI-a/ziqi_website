package com.ziqihome.backend.dto.project;

import com.ziqihome.backend.domain.ProjectStatus;
import java.time.Instant;
import java.util.List;

public record ProjectResponse(
    Long id,
    String slug,
    String name,
    String description,
    ProjectStatus status,
    String cover,
    String link,
    List<String> stack,
    List<String> highlights,
    Boolean published,
    Integer sortOrder,
    Instant createdAt,
    Instant updatedAt
) {
}
