package com.ziqihome.backend.controller;

import com.ziqihome.backend.dto.project.ProjectFormOptionsResponse;
import com.ziqihome.backend.dto.project.ProjectRequest;
import com.ziqihome.backend.dto.project.ProjectResponse;
import com.ziqihome.backend.service.ProjectService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/projects")
public class AdminProjectController {

  private final ProjectService projectService;

  public AdminProjectController(ProjectService projectService) {
    this.projectService = projectService;
  }

  @GetMapping
  public List<ProjectResponse> listProjects() {
    return projectService.listAdminProjects();
  }

  @GetMapping("/options")
  public ProjectFormOptionsResponse getProjectFormOptions() {
    return projectService.getProjectFormOptions();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ProjectResponse createProject(@Valid @RequestBody ProjectRequest request) {
    return projectService.createProject(request);
  }

  @PutMapping("/{id}")
  public ProjectResponse updateProject(
      @PathVariable Long id,
      @Valid @RequestBody ProjectRequest request
  ) {
    return projectService.updateProject(id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteProject(@PathVariable Long id) {
    projectService.deleteProject(id);
  }
}
