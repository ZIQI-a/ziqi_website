package com.ziqihome.backend.controller;

import com.ziqihome.backend.domain.ProjectStatus;
import com.ziqihome.backend.dto.blog.BlogPostResponse;
import com.ziqihome.backend.dto.contact.ContactLinkResponse;
import com.ziqihome.backend.dto.moment.MomentCategoryResponse;
import com.ziqihome.backend.dto.moment.MomentResponse;
import com.ziqihome.backend.dto.project.ProjectResponse;
import com.ziqihome.backend.service.BlogPostService;
import com.ziqihome.backend.service.ContactLinkService;
import com.ziqihome.backend.service.MomentCategoryService;
import com.ziqihome.backend.service.MomentService;
import com.ziqihome.backend.service.ProjectService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
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
  public List<BlogPostResponse> listSiteBlogs() {
    return blogPostService.listPublishedBlogs();
  }

  @GetMapping("/projects")
  public List<ProjectResponse> listSiteProjects(
      @RequestParam(required = false) ProjectStatus status
  ) {
    return projectService.listPublishedProjects(status);
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
