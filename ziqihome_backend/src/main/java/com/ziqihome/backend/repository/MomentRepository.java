package com.ziqihome.backend.repository;

import com.ziqihome.backend.domain.Moment;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * moments 列表读取时总会展示分类信息，因此直接把分类关联一起拉出来，避免多余查询。
 */
public interface MomentRepository extends JpaRepository<Moment, Long> {

  @EntityGraph(attributePaths = "category")
  List<Moment> findAllByOrderByPinnedDescCreatedAtDescIdDesc();

  @EntityGraph(attributePaths = "category")
  List<Moment> findAllByPublishedTrueOrderByPinnedDescCreatedAtDescIdDesc();

  @EntityGraph(attributePaths = "category")
  @Query("""
      select moment
      from Moment moment
      where moment.published = true
        and (:categoryId is null or moment.category.id = :categoryId)
        and (:showOnHome is null or moment.showOnHome = :showOnHome)
        and (
          :hasImage is null
          or (:hasImage = true and moment.imageUrl is not null)
          or (:hasImage = false and moment.imageUrl is null)
        )
      order by moment.pinned desc, moment.createdAt desc, moment.id desc
      """)
  List<Moment> findSiteMoments(
      @Param("categoryId") Long categoryId,
      @Param("showOnHome") Boolean showOnHome,
      @Param("hasImage") Boolean hasImage);

  // 分类查询
  @EntityGraph(attributePaths = "category")
  @Query("""
      select moment
      from Moment moment
      where (:categoryId is null or moment.category.id = :categoryId)
        and (:published is null or moment.published = :published)
      order by moment.pinned desc, moment.createdAt desc, moment.id desc
      """)
  List<Moment> findAdminMoments(
      @Param("categoryId") Long categoryId,
      @Param("published") Boolean published);

  boolean existsByCategoryId(Long categoryId);
}
