package com.ziqihome.backend;

import static org.assertj.core.api.Assertions.assertThat;

import com.ziqihome.backend.dto.blog.BlogPostRequest;
import com.ziqihome.backend.service.BlogPostService;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class BlogPostServiceTest {

  @Autowired
  private BlogPostService blogPostService;

  @Test
  void createAndUpdateBlogShouldPersistTagsAndOrder() {
    BlogPostRequest createRequest = new BlogPostRequest(
        "service-test-blog",
        "Service Test Blog",
        LocalDate.parse("2026-04-16"),
        "测试",
        "用于验证 service 层是否能正确写入博客与标签。",
        "https://example.com/blog-cover.jpg",
        List.of("Spring Boot", "CRUD"),
        true,
        7
    );

    var created = blogPostService.createBlog(createRequest);
    assertThat(created.id()).isNotNull();
    assertThat(created.tags()).containsExactly("Spring Boot", "CRUD");

    BlogPostRequest updateRequest = new BlogPostRequest(
        "service-test-blog",
        "Service Test Blog Updated",
        LocalDate.parse("2026-04-18"),
        "测试更新",
        "验证更新后不会保留旧标签。",
        "https://example.com/blog-cover-updated.jpg",
        List.of("Updated"),
        false,
        3
    );

    var updated = blogPostService.updateBlog(created.id(), updateRequest);
    assertThat(updated.title()).isEqualTo("Service Test Blog Updated");
    assertThat(updated.tags()).containsExactly("Updated");
    assertThat(updated.published()).isFalse();
    assertThat(blogPostService.listPublishedBlogs())
        .noneMatch(blog -> blog.id().equals(created.id()));
  }
}
