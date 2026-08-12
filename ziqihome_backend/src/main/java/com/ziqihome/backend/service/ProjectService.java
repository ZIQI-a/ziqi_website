package com.ziqihome.backend.service;

import com.ziqihome.backend.domain.Project;
import com.ziqihome.backend.domain.ProjectStatus;
import com.ziqihome.backend.dto.project.ProjectFormOptionsResponse;
import com.ziqihome.backend.dto.project.ProjectRequest;
import com.ziqihome.backend.dto.project.ProjectResponse;
import com.ziqihome.backend.dto.project.ProjectSiteFilterOptionsResponse;
import com.ziqihome.backend.dto.project.ProjectSiteSummaryResponse;
import com.ziqihome.backend.exception.ConflictException;
import com.ziqihome.backend.exception.ResourceNotFoundException;
import com.ziqihome.backend.mapper.ProjectMapper;
import com.ziqihome.backend.repository.ProjectRepository;
import java.util.Arrays;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProjectService {

  private final ProjectRepository projectRepository;
  private final ProjectMapper projectMapper;

  public ProjectService(ProjectRepository projectRepository, ProjectMapper projectMapper) {
    this.projectRepository = projectRepository;
    this.projectMapper = projectMapper;
  }

  @Transactional(readOnly = true)
  public List<ProjectResponse> listAdminProjects() {
    return projectRepository.findAllByOrderBySortOrderAscIdDesc()
        .stream()
        .map(projectMapper::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<ProjectSiteSummaryResponse> listPublishedProjects() {
    return listPublishedProjects(null);
  }

  @Transactional(readOnly = true)
  public List<ProjectSiteSummaryResponse> listPublishedProjects(ProjectStatus status) {
    // 公开项目列表只允许在已发布项目内按状态收窄，避免前端拿到未公开数据。
    return projectRepository.findSiteProjects(status)
        .stream()
        .map(projectMapper::toSiteSummary)
        .toList();
  }

  @Transactional(readOnly = true)
  public ProjectSiteFilterOptionsResponse listPublishedProjectFilterOptions() {
    // 只向公开页暴露确实存在已发布项目的阶段，并保持业务枚举声明顺序。
    List<ProjectStatus> publishedStatuses = projectRepository.findPublishedStatuses();
    List<String> statuses = Arrays.stream(ProjectStatus.values())
        .filter(publishedStatuses::contains)
        .map(Enum::name)
        .toList();
    return new ProjectSiteFilterOptionsResponse(statuses);
  }

  @Transactional(readOnly = true)
  public ProjectFormOptionsResponse getProjectFormOptions() {
    // 状态选项由后端枚举统一给出，避免前端再手写一份并承担枚举漂移风险。
    List<String> statusOptions = Arrays.stream(ProjectStatus.values())
        .map(Enum::name)
        .toList();

    // 技术栈候选项先从已有项目数据汇总，满足当前阶段的管理表单自动补全需求。
    List<String> stackOptions = projectRepository.findDistinctStackOptions();

    return new ProjectFormOptionsResponse(statusOptions, stackOptions);
  }

  public ProjectResponse createProject(ProjectRequest request) {
    validateUniqueSlug(request.slug(), null);
    Project project = new Project();
    projectMapper.updateEntity(project, request);
    return projectMapper.toResponse(projectRepository.save(project));
  }

  public ProjectResponse updateProject(Long id, ProjectRequest request) {
    Project project = getProjectOrThrow(id);
    validateUniqueSlug(request.slug(), id);
    projectMapper.updateEntity(project, request);
    return projectMapper.toResponse(projectRepository.save(project));
  }

  public void deleteProject(Long id) {
    projectRepository.delete(getProjectOrThrow(id));
  }

  private Project getProjectOrThrow(Long id) {
    return projectRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("项目不存在，id=" + id));
  }

  /** 在数据库约束前返回明确业务提示，便于管理表单直接定位重复 slug。 */
  private void validateUniqueSlug(String slug, Long currentProjectId) {
    String normalizedSlug = slug.trim();
    boolean duplicated = currentProjectId == null
        ? projectRepository.existsBySlug(normalizedSlug)
        : projectRepository.existsBySlugAndIdNot(normalizedSlug, currentProjectId);

    if (duplicated) {
      throw new ConflictException("项目 slug 已存在: " + normalizedSlug);
    }
  }
}
