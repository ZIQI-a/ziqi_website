package com.ziqihome.backend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ziqihome.backend.domain.BlogContentMode;
import com.ziqihome.backend.domain.BlogSourceType;
import com.ziqihome.backend.dto.blog.BlogPostRequest;
import com.ziqihome.backend.dto.blog.BlogPostResponse;
import com.ziqihome.backend.service.BlogPostService;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class BlogPostServiceTest {

  @Autowired
  private BlogPostService blogPostService;

  @Autowired
  private MockMvc mockMvc;

  @Test
  void createAndUpdateBlogShouldPersistTagsAndOrder() {
    BlogPostRequest createRequest = new BlogPostRequest(
        "service-test-blog",
        "Service Test Blog",
        LocalDate.parse("2026-04-16"),
        "测试",
        "用于验证 service 层是否能正确写入博客与标签。",
        "https://example.com/blog-cover.jpg",
        "# Service Test Blog\n\n这里是测试正文。",
        List.of("Spring Boot", "CRUD"),
        BlogContentMode.LOCAL,
        BlogSourceType.ORIGINAL,
        null,
        null,
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
        "# Service Test Blog Updated\n\n这里是更新后的正文。",
        List.of("Updated"),
        BlogContentMode.HYBRID,
        BlogSourceType.CSDN,
        "CSDN",
        "https://blog.csdn.net/example/article/details/1",
        false,
        3
    );

    var updated = blogPostService.updateBlog(created.id(), updateRequest);
    assertThat(updated.title()).isEqualTo("Service Test Blog Updated");
    assertThat(updated.tags()).containsExactly("Updated");
    assertThat(updated.sourceLabel()).isEqualTo("CSDN");
    assertThat(updated.published()).isFalse();
    assertThat(blogPostService.listPublishedBlogs(null, null, null))
        .noneMatch(blog -> blog.id().equals(created.id()));
  }

  @Test
  void publishedBlogFiltersShouldSupportCombinedConditionsAndTagIntersection() throws Exception {
    BlogPostResponse frontendBlog = createFilterBlog(
        "filter-frontend-blog",
        "React 性能优化记录",
        "筛选前端",
        "记录组件渲染与缓存策略。",
        List.of("FilterReact", "FilterTypeScript"),
        true
    );
    BlogPostResponse backendBlog = createFilterBlog(
        "filter-backend-blog",
        "Spring Boot 异常处理",
        "筛选后端",
        "整理服务端异常响应。",
        List.of("FilterSpring", "FilterTypeScript"),
        true
    );
    BlogPostResponse hiddenBlog = createFilterBlog(
        "filter-hidden-blog",
        "React 草稿",
        "筛选草稿",
        "未发布内容不能出现在公开筛选结果中。",
        List.of("FilterReact", "FilterHidden"),
        false
    );

    assertThat(blogPostService.listPublishedBlogs("react", null, null))
        .extracting(blog -> blog.id())
        .contains(frontendBlog.id())
        .doesNotContain(hiddenBlog.id());
    assertThat(blogPostService.listPublishedBlogs("FILTERTYPESCRIPT", null, null))
        .extracting(blog -> blog.id())
        .contains(frontendBlog.id(), backendBlog.id());
    assertThat(blogPostService.listPublishedBlogs(null, "筛选后端", null))
        .extracting(blog -> blog.id())
        .containsExactly(backendBlog.id());
    assertThat(blogPostService.listPublishedBlogs(
        null,
        null,
        List.of("FilterReact", "FilterTypeScript")
    ))
        .extracting(blog -> blog.id())
        .containsExactly(frontendBlog.id());
    assertThat(blogPostService.listPublishedBlogs(
        "缓存",
        "筛选前端",
        List.of("FilterReact", "FilterTypeScript")
    ))
        .extracting(blog -> blog.id())
        .containsExactly(frontendBlog.id());
    assertThat(blogPostService.listPublishedBlogs(" ", " ", List.of("", " ")))
        .extracting(blog -> blog.id())
        .contains(frontendBlog.id(), backendBlog.id())
        .doesNotContain(hiddenBlog.id());

    var filterOptions = blogPostService.listPublishedBlogFilterOptions();
    assertThat(filterOptions.categories())
        .contains("筛选前端", "筛选后端")
        .doesNotContain("筛选草稿")
        .isSorted();
    assertThat(filterOptions.tags())
        .contains("FilterReact", "FilterSpring", "FilterTypeScript")
        .doesNotContain("FilterHidden")
        .isSorted();

    mockMvc.perform(get("/api/site/blogs")
            .param("tags", "FilterReact", "FilterTypeScript"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].slug").value("filter-frontend-blog"));
    mockMvc.perform(get("/api/site/blogs/filter-options"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.categories", hasItem("筛选前端")))
        .andExpect(jsonPath("$.tags", hasItem("FilterTypeScript")));
  }

  private BlogPostResponse createFilterBlog(
      String slug,
      String title,
      String category,
      String summary,
      List<String> tags,
      boolean published
  ) {
    return blogPostService.createBlog(new BlogPostRequest(
        slug,
        title,
        LocalDate.parse("2026-08-08"),
        category,
        summary,
        "https://example.com/filter-cover.jpg",
        "# " + title + "\n\n这里是筛选测试正文。",
        tags,
        BlogContentMode.LOCAL,
        BlogSourceType.ORIGINAL,
        null,
        null,
        published,
        99
    ));
  }
}
