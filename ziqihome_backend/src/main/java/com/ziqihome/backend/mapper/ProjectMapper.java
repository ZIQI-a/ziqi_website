package com.ziqihome.backend.mapper;

import com.ziqihome.backend.domain.Project;
import com.ziqihome.backend.dto.project.ProjectRequest;
import com.ziqihome.backend.dto.project.ProjectResponse;
import com.ziqihome.backend.dto.project.ProjectSiteSummaryResponse;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {

  public ProjectResponse toResponse(Project project) {
    return new ProjectResponse(
        project.getId(),
        project.getSlug(),
        project.getName(),
        project.getDescription(),
        project.getStatus(),
        project.getCover(),
        project.getLink(),
        List.copyOf(project.getStack()),
        List.copyOf(project.getHighlights()),
        project.getPublished(),
        project.getSortOrder(),
        project.getCreatedAt(),
        project.getUpdatedAt()
    );
  }

  public ProjectSiteSummaryResponse toSiteSummary(Project project) {
    return new ProjectSiteSummaryResponse(
        project.getSlug(),
        project.getName(),
        project.getDescription(),
        project.getStatus(),
        project.getCover(),
        project.getLink(),
        List.copyOf(project.getStack())
    );
  }

  public void updateEntity(Project project, ProjectRequest request) {
    project.setSlug(request.slug().trim());
    project.setName(request.name().trim());
    project.setDescription(request.description().trim());
    project.setStatus(request.status());
    project.setCover(request.cover().trim());
    project.setLink(normalizeOptional(request.link()));
    project.setStack(normalizeList(request.stack()));
    project.setHighlights(normalizeList(request.highlights()));
    project.setPublished(request.published());
    project.setSortOrder(request.sortOrder());
  }

  private String normalizeOptional(String value) {
    if (value == null) {
      return null;
    }

    String normalized = value.trim();
    return normalized.isEmpty() ? null : normalized;
  }

  private List<String> normalizeList(List<String> source) {
    return source.stream()
        .filter(Objects::nonNull)
        .map(String::trim)
        .filter(value -> !value.isEmpty())
        .distinct()
        .toList();
  }
}
