package com.ziqihome.backend.controller;

import com.ziqihome.backend.domain.ProjectStatus;
import com.ziqihome.backend.dto.blog.BlogFilterOptionsResponse;
import com.ziqihome.backend.dto.blog.BlogSiteDetailResponse;
import com.ziqihome.backend.dto.blog.BlogSiteSummaryResponse;
import com.ziqihome.backend.dto.contact.ContactLinkResponse;
import com.ziqihome.backend.dto.moment.MomentCategoryResponse;
import com.ziqihome.backend.dto.moment.MomentResponse;
import com.ziqihome.backend.dto.project.ProjectSiteFilterOptionsResponse;
import com.ziqihome.backend.dto.project.ProjectSiteSummaryResponse;
import com.ziqihome.backend.service.BlogPostService;
import com.ziqihome.backend.service.ContactLinkService;
import com.ziqihome.backend.service.MomentCategoryService;
import com.ziqihome.backend.service.MomentService;
import com.ziqihome.backend.service.ProjectService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/site")
public class SiteContentController {

  private final BlogPostService blogPostService;
  private final ProjectService projectService;
  private final ContactLinkService contactLinkService;
  private final MomentService momentService;
  private final MomentCategoryService momentCategoryService;

  public SiteContentController(
      BlogPostService blogPostService,
      ProjectService projectService,
      ContactLinkService contactLinkService,
      MomentService momentService,
      MomentCategoryService momentCategoryService
  ) {
    this.blogPostService = blogPostService;
    this.projectService = projectService;
    this.contactLinkService = contactLinkService;
    this.momentService = momentService;
    this.momentCategoryService = momentCategoryService;
  }

  @GetMapping("/blogs")
  public List<BlogSiteSummaryResponse> listSiteBlogs(
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) String category,
      @RequestParam(required = false) List<String> tags
  ) {
    return blogPostService.listPublishedBlogs(keyword, category, tags);
  }

  @GetMapping("/blogs/filter-options")
  public BlogFilterOptionsResponse listSiteBlogFilterOptions() {
    return blogPostService.listPublishedBlogFilterOptions();
  }

  @GetMapping("/blogs/{slug}")
  public BlogSiteDetailResponse getSiteBlog(@PathVariable String slug) {
    return blogPostService.getPublishedBlogBySlug(slug);
  }

  @GetMapping("/projects")
  public List<ProjectSiteSummaryResponse> listSiteProjects(
      @RequestParam(required = false) ProjectStatus status
  ) {
    return projectService.listPublishedProjects(status);
  }

  @GetMapping("/projects/filter-options")
  public ProjectSiteFilterOptionsResponse listSiteProjectFilterOptions() {
    return projectService.listPublishedProjectFilterOptions();
  }

  @GetMapping("/contact-links")
  public List<ContactLinkResponse> listSiteContactLinks() {
    return contactLinkService.listPublishedContactLinks();
  }

  @GetMapping("/moments")
  public List<MomentResponse> listSiteMoments(
      @RequestParam(required = false) Long categoryId,
      @RequestParam(required = false) Boolean showOnHome,
      @RequestParam(required = false) Boolean hasImage
  ) {
    return momentService.listPublishedMoments(categoryId, showOnHome, hasImage);
  }

  @GetMapping("/moments/categories")
  public List<MomentCategoryResponse> listSiteMomentCategories() {
    return momentCategoryService.listCategories();
  }
}
