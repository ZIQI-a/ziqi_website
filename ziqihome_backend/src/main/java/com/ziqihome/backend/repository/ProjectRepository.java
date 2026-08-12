package com.ziqihome.backend.repository;

import com.ziqihome.backend.domain.Project;
import com.ziqihome.backend.domain.ProjectStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRepository extends JpaRepository<Project, Long> {

  List<Project> findAllByOrderBySortOrderAscIdDesc();

  List<Project> findAllByPublishedTrueOrderBySortOrderAscIdDesc();

  // 根据状态过滤查询
  @Query("""
      select project
      from Project project
      where project.published = true
        and (:status is null or project.status = :status)
      order by project.sortOrder asc, project.id desc
      """)
  List<Project> findSiteProjects(@Param("status") ProjectStatus status);

  Optional<Project> findBySlug(String slug);

  boolean existsBySlug(String slug);

  boolean existsBySlugAndIdNot(String slug, Long id);

  @Query("""
      select distinct project.status
      from Project project
      where project.published = true
      order by project.status asc
      """)
  List<ProjectStatus> findPublishedStatuses();

  @Query("""
      select distinct stackItem
      from Project project
      join project.stack stackItem
      order by stackItem asc
      """)
  List<String> findDistinctStackOptions();
}
