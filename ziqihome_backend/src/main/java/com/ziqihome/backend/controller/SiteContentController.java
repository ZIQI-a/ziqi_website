package com.ziqihome.backend.controller;

import com.ziqihome.backend.dto.blog.BlogPostResponse;
import com.ziqihome.backend.dto.project.ProjectResponse;
import com.ziqihome.backend.service.BlogPostService;
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

  public SiteContentController(BlogPostService blogPostService, ProjectService projectService) {
    this.blogPostService = blogPostService;
    this.projectService = projectService;
  }

  @GetMapping("/blogs")
  public List<BlogPostResponse> listSiteBlogs() {
    return blogPostService.listPublishedBlogs();
  }

  @GetMapping("/projects")
  public List<ProjectResponse> listSiteProjects() {
    return projectService.listPublishedProjects();
  }
}
