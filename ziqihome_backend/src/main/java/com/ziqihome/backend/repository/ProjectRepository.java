package com.ziqihome.backend.repository;

import com.ziqihome.backend.domain.Project;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProjectRepository extends JpaRepository<Project, Long> {

  List<Project> findAllByOrderBySortOrderAscIdDesc();

  List<Project> findAllByPublishedTrueOrderBySortOrderAscIdDesc();

  Optional<Project> findBySlug(String slug);

  @Query("""
      select distinct stackItem
      from Project project
      join project.stack stackItem
      order by stackItem asc
      """)
  List<String> findDistinctStackOptions();
}
