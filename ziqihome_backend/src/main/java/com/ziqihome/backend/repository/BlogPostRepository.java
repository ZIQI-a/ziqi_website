package com.ziqihome.backend.repository;

import com.ziqihome.backend.domain.BlogPost;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {

  List<BlogPost> findAllByOrderBySortOrderAscPublishDateDescIdDesc();

  List<BlogPost> findAllByPublishedTrueOrderBySortOrderAscPublishDateDescIdDesc();

  Optional<BlogPost> findBySlug(String slug);
}
