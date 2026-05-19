package com.ziqihome.backend.controller;

import com.ziqihome.backend.dto.blog.BlogPostRequest;
import com.ziqihome.backend.dto.blog.BlogPostResponse;
import com.ziqihome.backend.service.BlogPostService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/blogs")
public class AdminBlogController {

  private final BlogPostService blogPostService;

  public AdminBlogController(BlogPostService blogPostService) {
    this.blogPostService = blogPostService;
  }

  @GetMapping
  public List<BlogPostResponse> listBlogs() {
    return blogPostService.listAdminBlogs();
  }

  @GetMapping("/{id}")
  public BlogPostResponse getBlog(@PathVariable Long id) {
    return blogPostService.getAdminBlog(id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public BlogPostResponse createBlog(@Valid @RequestBody BlogPostRequest request) {
    return blogPostService.createBlog(request);
  }

  @PutMapping("/{id}")
  public BlogPostResponse updateBlog(
      @PathVariable Long id,
      @Valid @RequestBody BlogPostRequest request
  ) {
    return blogPostService.updateBlog(id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteBlog(@PathVariable Long id) {
    blogPostService.deleteBlog(id);
  }
}
