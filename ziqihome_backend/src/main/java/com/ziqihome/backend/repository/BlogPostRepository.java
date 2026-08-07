package com.ziqihome.backend.repository;

import com.ziqihome.backend.domain.BlogPost;
import com.ziqihome.backend.domain.BlogSourceType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface BlogPostRepository extends
    JpaRepository<BlogPost, Long>,
    JpaSpecificationExecutor<BlogPost> {

  List<BlogPost> findAllByOrderBySortOrderAscPublishDateDescIdDesc();

  List<BlogPost> findAllByPublishedTrueOrderBySortOrderAscPublishDateDescIdDesc();

  @Query("""
      select distinct blog.category
      from BlogPost blog
      where blog.published = true
      order by blog.category asc
      """)
  List<String> findPublishedCategories();

  @Query("""
      select distinct tag
      from BlogPost blog join blog.tags tag
      where blog.published = true
      order by tag asc
      """)
  List<String> findPublishedTags();

  Optional<BlogPost> findBySlug(String slug);

  Optional<BlogPost> findBySlugAndPublishedTrue(String slug);

  Optional<BlogPost> findBySourceTypeAndSourceRepoAndSourceDocId(
      BlogSourceType sourceType,
      String sourceRepo,
      String sourceDocId
  );
}
