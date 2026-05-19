package com.ziqihome.backend.mapper;

import com.ziqihome.backend.domain.BlogPost;
import com.ziqihome.backend.dto.blog.BlogPostRequest;
import com.ziqihome.backend.dto.blog.BlogPostResponse;
import com.ziqihome.backend.dto.blog.BlogSiteDetailResponse;
import com.ziqihome.backend.dto.blog.BlogSiteSummaryResponse;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class BlogPostMapper {

  public BlogPostResponse toResponse(BlogPost blogPost) {
    return new BlogPostResponse(
        blogPost.getId(),
        blogPost.getSlug(),
        blogPost.getTitle(),
        blogPost.getPublishDate(),
        blogPost.getCategory(),
        blogPost.getSummary(),
        blogPost.getCover(),
        blogPost.getContentMarkdown(),
        List.copyOf(blogPost.getTags()),
        blogPost.getContentMode(),
        blogPost.getSourceType(),
        blogPost.getSourceLabel(),
        blogPost.getSourceUrl(),
        blogPost.getPublished(),
        blogPost.getSortOrder(),
        blogPost.getCreatedAt(),
        blogPost.getUpdatedAt()
    );
  }

  public BlogSiteSummaryResponse toSiteSummary(BlogPost blogPost) {
    return new BlogSiteSummaryResponse(
        blogPost.getId(),
        blogPost.getSlug(),
        blogPost.getTitle(),
        blogPost.getPublishDate(),
        blogPost.getCategory(),
        blogPost.getSummary(),
        blogPost.getCover(),
        List.copyOf(blogPost.getTags()),
        blogPost.getContentMode(),
        blogPost.getSourceType(),
        blogPost.getSourceLabel(),
        blogPost.getSourceUrl());
  }

  public BlogSiteDetailResponse toSiteDetail(BlogPost blogPost) {
    return new BlogSiteDetailResponse(
        blogPost.getId(),
        blogPost.getSlug(),
        blogPost.getTitle(),
        blogPost.getPublishDate(),
        blogPost.getCategory(),
        blogPost.getSummary(),
        blogPost.getCover(),
        List.copyOf(blogPost.getTags()),
        blogPost.getContentMarkdown(),
        blogPost.getContentMode(),
        blogPost.getSourceType(),
        blogPost.getSourceLabel(),
        blogPost.getSourceUrl());
  }

  public void updateEntity(BlogPost blogPost, BlogPostRequest request) {
    // 统一在 mapper 中做字段搬运，避免控制器或 service 混入大量样板赋值代码。
    blogPost.setSlug(request.slug().trim());
    blogPost.setTitle(request.title().trim());
    blogPost.setPublishDate(request.publishDate());
    blogPost.setCategory(request.category().trim());
    blogPost.setSummary(request.summary().trim());
    blogPost.setCover(request.cover().trim());
    blogPost.setContentMarkdown(request.contentMarkdown().trim());
    blogPost.setTags(normalizeList(request.tags()));
    blogPost.setContentMode(request.contentMode());
    blogPost.setSourceType(request.sourceType());
    blogPost.setSourceLabel(normalizeNullableText(request.sourceLabel()));
    blogPost.setSourceUrl(normalizeNullableText(request.sourceUrl()));
    blogPost.setPublished(request.published());
    blogPost.setSortOrder(request.sortOrder());
  }

  private List<String> normalizeList(List<String> source) {
    return source.stream()
        .map(String::trim)
        .filter(value -> !value.isEmpty())
        .toList();
  }

  private String normalizeNullableText(String value) {
    if (value == null) {
      return null;
    }

    String normalized = value.trim();
    return normalized.isEmpty() ? null : normalized;
  }
}
