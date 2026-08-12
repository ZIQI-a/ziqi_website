package com.ziqihome.backend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.ziqihome.backend.domain.ProjectStatus;
import com.ziqihome.backend.dto.project.ProjectRequest;
import com.ziqihome.backend.exception.ConflictException;
import com.ziqihome.backend.service.ProjectService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/** 项目业务测试覆盖阶段、公开隔离、排序、筛选项和 slug 唯一性。 */
@SpringBootTest
@ActiveProfiles("test")
class ProjectServiceTest {

  @Autowired
  private ProjectService projectService;

  @Test
  void publishedProjectsShouldBeSortedFilteredAndUsePublicSummary() {
    var laterProject = projectService.createProject(projectRequest(
        "service-later-project",
        ProjectStatus.开发中,
        true,
        20
    ));
    var firstProject = projectService.createProject(projectRequest(
        "service-first-project",
        ProjectStatus.已完成,
        true,
        10
    ));
    var hiddenProject = projectService.createProject(projectRequest(
        "service-hidden-project",
        ProjectStatus.构思中,
        false,
        0
    ));

    var publicProjects = projectService.listPublishedProjects();
    assertThat(publicProjects)
        .filteredOn(project -> project.slug().startsWith("service-"))
        .extracting(project -> project.slug())
        .containsExactly("service-first-project", "service-later-project");
    assertThat(projectService.listPublishedProjects(ProjectStatus.已完成))
        .extracting(project -> project.slug())
        .contains("service-first-project")
        .doesNotContain("service-later-project", "service-hidden-project");

    var filterOptions = projectService.listPublishedProjectFilterOptions();
    assertThat(filterOptions.statuses())
        .contains(ProjectStatus.开发中.name(), ProjectStatus.已完成.name())
        .doesNotContain(ProjectStatus.构思中.name());

    projectService.deleteProject(laterProject.id());
    projectService.deleteProject(firstProject.id());
    projectService.deleteProject(hiddenProject.id());
  }

  @Test
  void createProjectShouldNormalizeListsAndRejectDuplicateSlug() {
    ProjectRequest request = new ProjectRequest(
        "service-unique-project",
        "Project service test",
        "验证项目列表清洗和 slug 冲突提示。",
        ProjectStatus.开发中,
        "https://example.com/project-cover.jpg",
        "",
        List.of("React", " React ", "TypeScript"),
        List.of("业务闭环", " 业务闭环 ", "公开隔离"),
        true,
        5
    );

    var created = projectService.createProject(request);
    assertThat(created.stack()).containsExactly("React", "TypeScript");
    assertThat(created.highlights()).containsExactly("业务闭环", "公开隔离");
    assertThatThrownBy(() -> projectService.createProject(request))
        .isInstanceOf(ConflictException.class)
        .hasMessageContaining("项目 slug 已存在");

    projectService.deleteProject(created.id());
  }

  private ProjectRequest projectRequest(
      String slug,
      ProjectStatus status,
      boolean published,
      int sortOrder
  ) {
    return new ProjectRequest(
        slug,
        slug,
        "用于验证项目公开查询规则。",
        status,
        "https://example.com/" + slug + ".jpg",
        "https://example.com/" + slug,
        List.of("Spring Boot"),
        List.of("服务层测试"),
        published,
        sortOrder
    );
  }
}
