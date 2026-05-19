package com.ziqihome.backend.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "blog_posts")
public class BlogPost {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 120)
  private String slug;

  @Column(nullable = false, length = 150)
  private String title;

  @Column(nullable = false)
  private LocalDate publishDate;

  @Column(nullable = false, length = 80)
  private String category;

  @Column(nullable = false, length = 600)
  private String summary;

  @Column(nullable = false, length = 255)
  private String cover;

  @Column(nullable = false, columnDefinition = "MEDIUMTEXT")
  private String contentMarkdown = "";

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private BlogContentMode contentMode = BlogContentMode.LOCAL;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private BlogSourceType sourceType = BlogSourceType.ORIGINAL;

  @Column(length = 80)
  private String sourceLabel;

  @Column(length = 255)
  private String sourceUrl;

  @Column(nullable = false)
  private Boolean published = true;

  @Column(nullable = false)
  private Integer sortOrder = 0;

  @Column(nullable = false, updatable = false)
  private Instant createdAt;

  @Column(nullable = false)
  private Instant updatedAt;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "blog_tags", joinColumns = @JoinColumn(name = "blog_post_id"))
  @Column(name = "tag", nullable = false, length = 60)
  @OrderColumn(name = "tag_order")
  private List<String> tags = new ArrayList<>();

  @PrePersist
  void prePersist() {
    Instant now = Instant.now();
    createdAt = now;
    updatedAt = now;
  }

  @PreUpdate
  void preUpdate() {
    updatedAt = Instant.now();
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getSlug() {
    return slug;
  }

  public void setSlug(String slug) {
    this.slug = slug;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public LocalDate getPublishDate() {
    return publishDate;
  }

  public void setPublishDate(LocalDate publishDate) {
    this.publishDate = publishDate;
  }

  public String getCategory() {
    return category;
  }

  public void setCategory(String category) {
    this.category = category;
  }

  public String getSummary() {
    return summary;
  }

  public void setSummary(String summary) {
    this.summary = summary;
  }

  public String getCover() {
    return cover;
  }

  public void setCover(String cover) {
    this.cover = cover;
  }

  public String getContentMarkdown() {
    return contentMarkdown;
  }

  public void setContentMarkdown(String contentMarkdown) {
    this.contentMarkdown = contentMarkdown;
  }

  public BlogContentMode getContentMode() {
    return contentMode;
  }

  public void setContentMode(BlogContentMode contentMode) {
    this.contentMode = contentMode;
  }

  public BlogSourceType getSourceType() {
    return sourceType;
  }

  public void setSourceType(BlogSourceType sourceType) {
    this.sourceType = sourceType;
  }

  public String getSourceLabel() {
    return sourceLabel;
  }

  public void setSourceLabel(String sourceLabel) {
    this.sourceLabel = sourceLabel;
  }

  public String getSourceUrl() {
    return sourceUrl;
  }

  public void setSourceUrl(String sourceUrl) {
    this.sourceUrl = sourceUrl;
  }

  public Boolean getPublished() {
    return published;
  }

  public void setPublished(Boolean published) {
    this.published = published;
  }

  public Integer getSortOrder() {
    return sortOrder;
  }

  public void setSortOrder(Integer sortOrder) {
    this.sortOrder = sortOrder;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public List<String> getTags() {
    return tags;
  }

  public void setTags(List<String> tags) {
    this.tags = new ArrayList<>(tags);
  }
}
