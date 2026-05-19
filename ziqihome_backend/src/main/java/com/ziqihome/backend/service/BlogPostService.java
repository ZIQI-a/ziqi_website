package com.ziqihome.backend.service;

import com.ziqihome.backend.domain.BlogPost;
import com.ziqihome.backend.dto.blog.BlogPostRequest;
import com.ziqihome.backend.dto.blog.BlogPostResponse;
import com.ziqihome.backend.dto.blog.BlogSiteDetailResponse;
import com.ziqihome.backend.dto.blog.BlogSiteSummaryResponse;
import com.ziqihome.backend.exception.ResourceNotFoundException;
import com.ziqihome.backend.mapper.BlogPostMapper;
import com.ziqihome.backend.repository.BlogPostRepository;
import java.util.List;
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
  public List<BlogSiteSummaryResponse> listPublishedBlogs() {
    return blogPostRepository.findAllByPublishedTrueOrderBySortOrderAscPublishDateDescIdDesc()
        .stream()
        .map(blogPostMapper::toSiteSummary)
        .toList();
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
}
