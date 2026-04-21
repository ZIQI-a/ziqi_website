package com.ziqihome.backend.controller;

import com.ziqihome.backend.dto.blog.BlogPostResponse;
import com.ziqihome.backend.dto.contact.ContactLinkResponse;
import com.ziqihome.backend.dto.project.ProjectResponse;
import com.ziqihome.backend.service.BlogPostService;
import com.ziqihome.backend.service.ContactLinkService;
import com.ziqihome.backend.service.ProjectService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/site")
public class SiteContentController {

  private final BlogPostService blogPostService;
  private final ProjectService projectService;
  private final ContactLinkService contactLinkService;

  public SiteContentController(
      BlogPostService blogPostService,
      ProjectService projectService,
      ContactLinkService contactLinkService
  ) {
    this.blogPostService = blogPostService;
    this.projectService = projectService;
    this.contactLinkService = contactLinkService;
  }

  @GetMapping("/blogs")
  public List<BlogPostResponse> listSiteBlogs() {
    return blogPostService.listPublishedBlogs();
  }

  @GetMapping("/projects")
  public List<ProjectResponse> listSiteProjects() {
    return projectService.listPublishedProjects();
  }

  @GetMapping("/contact-links")
  public List<ContactLinkResponse> listSiteContactLinks() {
    return contactLinkService.listPublishedContactLinks();
  }
}
