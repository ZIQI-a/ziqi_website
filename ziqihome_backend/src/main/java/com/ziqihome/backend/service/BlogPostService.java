package com.ziqihome.backend.service;

import com.ziqihome.backend.domain.BlogPost;
import com.ziqihome.backend.dto.blog.BlogPostRequest;
import com.ziqihome.backend.dto.blog.BlogPostResponse;
import com.ziqihome.backend.dto.blog.BlogFilterOptionsResponse;
import com.ziqihome.backend.dto.blog.BlogSiteDetailResponse;
import com.ziqihome.backend.dto.blog.BlogSiteSummaryResponse;
import com.ziqihome.backend.exception.ResourceNotFoundException;
import com.ziqihome.backend.mapper.BlogPostMapper;
import com.ziqihome.backend.repository.BlogPostRepository;
import com.ziqihome.backend.repository.BlogPostSpecifications;
import java.util.List;
import java.util.Objects;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BlogPostService {

  private final BlogPostRepository blogPostRepository;
  private final BlogPostMapper blogPostMapper;

  public BlogPostService(BlogPostRepository blogPostRepository, BlogPostMapper blogPostMapper) {
    this.blogPostRepository = blogPostRepository;
    this.blogPostMapper = blogPostMapper;
  }

  @Transactional(readOnly = true)
  public List<BlogPostResponse> listAdminBlogs() {
    return blogPostRepository.findAllByOrderBySortOrderAscPublishDateDescIdDesc()
        .stream()
        .map(blogPostMapper::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public BlogPostResponse getAdminBlog(Long id) {
    return blogPostMapper.toResponse(getBlogOrThrow(id));
  }

  @Transactional(readOnly = true)
  public List<BlogSiteSummaryResponse> listPublishedBlogs(
      String keyword,
      String category,
      List<String> tags
  ) {
    String normalizedKeyword = normalizeFilter(keyword);
    String normalizedCategory = normalizeFilter(category);
    List<String> normalizedTags = normalizeTags(tags);
    Sort sort = Sort.by(
        Sort.Order.asc("sortOrder"),
        Sort.Order.desc("publishDate"),
        Sort.Order.desc("id")
    );

    return blogPostRepository.findAll(
            BlogPostSpecifications.publishedWithFilters(
                normalizedKeyword,
                normalizedCategory,
                normalizedTags
            ),
            sort
        )
        .stream()
        .map(blogPostMapper::toSiteSummary)
        .toList();
  }

  @Transactional(readOnly = true)
  public BlogFilterOptionsResponse listPublishedBlogFilterOptions() {
    return new BlogFilterOptionsResponse(
        blogPostRepository.findPublishedCategories(),
        blogPostRepository.findPublishedTags()
    );
  }

  @Transactional(readOnly = true)
  public BlogSiteDetailResponse getPublishedBlogBySlug(String slug) {
    BlogPost blogPost = blogPostRepository.findBySlugAndPublishedTrue(slug)
        .orElseThrow(() -> new ResourceNotFoundException("博客不存在，slug=" + slug));
    return blogPostMapper.toSiteDetail(blogPost);
  }

  public BlogPostResponse createBlog(BlogPostRequest request) {
    BlogPost blogPost = new BlogPost();
    blogPostMapper.updateEntity(blogPost, request);
    return blogPostMapper.toResponse(blogPostRepository.save(blogPost));
  }

  public BlogPostResponse updateBlog(Long id, BlogPostRequest request) {
    BlogPost blogPost = getBlogOrThrow(id);
    blogPostMapper.updateEntity(blogPost, request);
    return blogPostMapper.toResponse(blogPostRepository.save(blogPost));
  }

  public void deleteBlog(Long id) {
    blogPostRepository.delete(getBlogOrThrow(id));
  }

  private BlogPost getBlogOrThrow(Long id) {
    return blogPostRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("博客不存在，id=" + id));
  }

  private String normalizeFilter(String value) {
    if (value == null) {
      return null;
    }

    String normalized = value.trim();
    return normalized.isEmpty() ? null : normalized;
  }

  /**
   * 去除空标签和重复标签，避免重复 EXISTS 条件增加无意义查询成本。
   */
  private List<String> normalizeTags(List<String> tags) {
    if (tags == null) {
      return List.of();
    }

    return tags.stream()
        .filter(Objects::nonNull)
        .map(String::trim)
        .filter(tag -> !tag.isEmpty())
        .distinct()
        .toList();
  }
}
