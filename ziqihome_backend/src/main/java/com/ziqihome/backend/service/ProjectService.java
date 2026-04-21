package com.ziqihome.backend.service;

import com.ziqihome.backend.domain.Project;
import com.ziqihome.backend.domain.ProjectStatus;
import com.ziqihome.backend.dto.project.ProjectFormOptionsResponse;
import com.ziqihome.backend.dto.project.ProjectRequest;
import com.ziqihome.backend.dto.project.ProjectResponse;
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
  public List<ProjectResponse> listPublishedProjects() {
    return projectRepository.findAllByPublishedTrueOrderBySortOrderAscIdDesc()
        .stream()
        .map(projectMapper::toResponse)
        .toList();
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
    Project project = new Project();
    projectMapper.updateEntity(project, request);
    return projectMapper.toResponse(projectRepository.save(project));
  }

  public ProjectResponse updateProject(Long id, ProjectRequest request) {
    Project project = getProjectOrThrow(id);
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
}
