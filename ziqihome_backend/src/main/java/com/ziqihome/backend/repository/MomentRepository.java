package com.ziqihome.backend.repository;

import com.ziqihome.backend.domain.Moment;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * moments 列表读取时总会展示分类信息，因此直接把分类关联一起拉出来，避免多余查询。
 */
public interface MomentRepository extends JpaRepository<Moment, Long> {

  @EntityGraph(attributePaths = "category")
  List<Moment> findAllByOrderByPinnedDescCreatedAtDescIdDesc();

  @EntityGraph(attributePaths = "category")
  List<Moment> findAllByPublishedTrueOrderByPinnedDescCreatedAtDescIdDesc();

  boolean existsByCategoryId(Long categoryId);
}
