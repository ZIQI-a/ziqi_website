package com.ziqihome.backend.repository;

import com.ziqihome.backend.domain.BlogPost;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.data.jpa.domain.Specification;

/**
 * 公开博客组合查询条件，集中维护数据库筛选规则，避免 service 拼接查询细节。
 */
public final class BlogPostSpecifications {

  private BlogPostSpecifications() {
  }

  public static Specification<BlogPost> publishedWithFilters(
      String keyword,
      String category,
      List<String> tags
  ) {
    return (root, query, criteriaBuilder) -> {
      List<Predicate> predicates = new ArrayList<>();
      predicates.add(criteriaBuilder.isTrue(root.get("published")));

      if (category != null) {
        predicates.add(criteriaBuilder.equal(root.get("category"), category));
      }

      if (keyword != null) {
        String keywordPattern = "%" + keyword.toLowerCase(Locale.ROOT) + "%";
        predicates.add(criteriaBuilder.or(
            criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), keywordPattern),
            criteriaBuilder.like(criteriaBuilder.lower(root.get("summary")), keywordPattern),
            criteriaBuilder.exists(buildTagKeywordSubquery(
                root,
                query.subquery(Long.class),
                criteriaBuilder,
                keywordPattern
            ))
        ));
      }

      // 每个标签分别增加 EXISTS 条件，确保多标签筛选采用交集语义。
      for (String tag : tags) {
        predicates.add(criteriaBuilder.exists(buildExactTagSubquery(
            root,
            query.subquery(Long.class),
            criteriaBuilder,
            tag
        )));
      }

      return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
    };
  }

  private static Subquery<Long> buildTagKeywordSubquery(
      Root<BlogPost> outerBlog,
      Subquery<Long> subquery,
      CriteriaBuilder criteriaBuilder,
      String keywordPattern
  ) {
    Root<BlogPost> taggedBlog = subquery.from(BlogPost.class);
    Join<BlogPost, String> tag = taggedBlog.join("tags");
    return subquery.select(taggedBlog.get("id"))
        .where(
            criteriaBuilder.equal(taggedBlog.get("id"), outerBlog.get("id")),
            criteriaBuilder.like(criteriaBuilder.lower(tag), keywordPattern)
        );
  }

  private static Subquery<Long> buildExactTagSubquery(
      Root<BlogPost> outerBlog,
      Subquery<Long> subquery,
      CriteriaBuilder criteriaBuilder,
      String expectedTag
  ) {
    Root<BlogPost> taggedBlog = subquery.from(BlogPost.class);
    Join<BlogPost, String> tag = taggedBlog.join("tags");
    return subquery.select(taggedBlog.get("id"))
        .where(
            criteriaBuilder.equal(taggedBlog.get("id"), outerBlog.get("id")),
            criteriaBuilder.equal(tag, expectedTag)
        );
  }
}
