package com.ziqihome.backend.service;

import com.ziqihome.backend.domain.BlogContentMode;
import com.ziqihome.backend.domain.BlogPost;
import com.ziqihome.backend.domain.BlogSourceType;
import com.ziqihome.backend.dto.blogsync.YuqueSyncCommitRequest;
import com.ziqihome.backend.dto.blogsync.YuqueSyncCommitResponse;
import com.ziqihome.backend.dto.blogsync.YuqueSyncPreviewItem;
import com.ziqihome.backend.dto.blogsync.YuqueSyncPreviewRequest;
import com.ziqihome.backend.dto.blogsync.YuqueSyncPreviewResponse;
import com.ziqihome.backend.dto.blogsync.YuqueSyncResultItem;
import com.ziqihome.backend.dto.blogsync.YuqueSyncSelectionRequest;
import com.ziqihome.backend.exception.BadRequestException;
import com.ziqihome.backend.repository.BlogPostRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class YuqueSyncService {

  private static final String DEFAULT_BLOG_COVER =
      "https://myphoto-1307175277.cos.ap-chengdu.myqcloud.com/mywebsite/image/time3.jpg";

  private final BlogPostRepository blogPostRepository;
  private final YuqueClient yuqueClient;

  public YuqueSyncService(BlogPostRepository blogPostRepository, YuqueClient yuqueClient) {
    this.blogPostRepository = blogPostRepository;
    this.yuqueClient = yuqueClient;
  }

  public YuqueSyncPreviewResponse preview(YuqueSyncPreviewRequest request) {
    List<YuqueSyncPreviewItem> items = yuqueClient.listDocuments(request.token(), normalizeRepo(request.repoNamespace()))
        .stream()
        .sorted(Comparator.comparing(YuqueClient.YuqueDocumentSummary::updatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
        .map(document -> buildPreviewItem(request.repoNamespace(), document))
        .toList();

    return new YuqueSyncPreviewResponse(request.repoNamespace().trim(), items.size(), items);
  }

  @Transactional
  public YuqueSyncCommitResponse sync(YuqueSyncCommitRequest request) {
    String normalizedRepo = normalizeRepo(request.repoNamespace());
    List<String> defaultTags = normalizeTags(request.defaultTags());
    if (defaultTags.isEmpty()) {
      throw new BadRequestException("至少保留一个默认标签");
    }

    Map<String, YuqueClient.YuqueDocumentSummary> documentMap = new LinkedHashMap<>();
    yuqueClient.listDocuments(request.token(), normalizedRepo)
        .forEach(document -> documentMap.put(document.id(), document));

    int createdCount = 0;
    int updatedCount = 0;
    List<YuqueSyncResultItem> results = new ArrayList<>();

    for (YuqueSyncSelectionRequest selection : request.selections()) {
      YuqueClient.YuqueDocumentSummary summary = documentMap.get(selection.docId().trim());
      if (summary == null) {
        throw new BadRequestException("语雀文档不存在或已从当前知识库移除：%s".formatted(selection.docId()));
      }

      YuqueClient.YuqueDocumentDetail detail = yuqueClient.getDocument(
          request.token(),
          summary.repoId(),
          summary.id()
      );

      BlogPost blogPost = findExistingBlog(normalizedRepo, selection.docId().trim(), summary.slug())
          .orElseGet(BlogPost::new);
      boolean creating = blogPost.getId() == null;

      applyDocumentToBlog(blogPost, detail, request, normalizedRepo, defaultTags);
      BlogPost saved = blogPostRepository.save(blogPost);

      if (creating) {
        createdCount++;
      } else {
        updatedCount++;
      }

      results.add(new YuqueSyncResultItem(
          saved.getId(),
          saved.getTitle(),
          creating ? "CREATED" : "UPDATED",
          detail.id()
      ));
    }

    return new YuqueSyncCommitResponse(createdCount, updatedCount, results);
  }

  private YuqueSyncPreviewItem buildPreviewItem(
      String repoNamespace,
      YuqueClient.YuqueDocumentSummary document
  ) {
    Optional<BlogPost> existingBlog = findExistingBlog(repoNamespace.trim(), document.id(), document.slug());
    String action = existingBlog
        .map(blog -> shouldUpdate(blog, document.updatedAt()) ? "UPDATE" : "SKIP")
        .orElse("CREATE");

    return new YuqueSyncPreviewItem(
        document.id(),
        document.slug(),
        document.title(),
        firstNonBlank(document.description(), "等待同步后生成摘要"),
        document.url(),
        formatInstant(document.updatedAt()),
        action,
        existingBlog.map(BlogPost::getId).orElse(null),
        existingBlog.map(BlogPost::getTitle).orElse(null)
    );
  }

  private Optional<BlogPost> findExistingBlog(String repoNamespace, String docId, String slug) {
    Optional<BlogPost> fromSource = blogPostRepository.findBySourceTypeAndSourceRepoAndSourceDocId(
        BlogSourceType.YUQUE,
        repoNamespace,
        docId
    );

    if (fromSource.isPresent()) {
      return fromSource;
    }

    return blogPostRepository.findBySlug(slug);
  }

  /**
   * 同步默认只覆盖语雀正文相关内容；已存在博客的手工分类、封面、标签优先保留，避免一次同步冲掉本地整理。
   */
  private void applyDocumentToBlog(
      BlogPost blogPost,
      YuqueClient.YuqueDocumentDetail detail,
      YuqueSyncCommitRequest request,
      String repoNamespace,
      List<String> defaultTags
  ) {
    String markdown = normalizeBody(detail.body());
    String title = detail.title() == null || detail.title().isBlank() ? detail.slug() : detail.title().trim();
    boolean creating = blogPost.getId() == null;

    if (creating) {
      blogPost.setSlug(slugify(detail.slug(), title));
      blogPost.setCategory(request.defaultCategory().trim());
      blogPost.setCover(firstNonBlank(normalizeNullableUrl(request.defaultCover()), DEFAULT_BLOG_COVER));
      blogPost.setTags(defaultTags);
      blogPost.setSortOrder(0);
    } else {
      if (blogPost.getCategory() == null || blogPost.getCategory().isBlank()) {
        blogPost.setCategory(request.defaultCategory().trim());
      }
      if (blogPost.getCover() == null || blogPost.getCover().isBlank()) {
        blogPost.setCover(firstNonBlank(normalizeNullableUrl(request.defaultCover()), DEFAULT_BLOG_COVER));
      }
      if (blogPost.getTags().isEmpty()) {
        blogPost.setTags(defaultTags);
      }
    }

    blogPost.setTitle(title);
    blogPost.setPublishDate(resolvePublishDate(detail.publishedAt()));
    blogPost.setSummary(extractSummary(markdown, detail.description()));
    blogPost.setContentMarkdown(markdown);
    blogPost.setContentMode(detail.url() == null || detail.url().isBlank() ? BlogContentMode.LOCAL : BlogContentMode.HYBRID);
    blogPost.setSourceType(BlogSourceType.YUQUE);
    blogPost.setSourceLabel("语雀");
    blogPost.setSourceUrl(normalizeNullableUrl(detail.url()));
    blogPost.setSourceRepo(repoNamespace);
    blogPost.setSourceDocId(detail.id());
    blogPost.setSourceUpdatedAt(detail.updatedAt());
    blogPost.setLastSyncedAt(Instant.now());
    blogPost.setPublished(request.publishImported());
  }

  private boolean shouldUpdate(BlogPost blogPost, Instant remoteUpdatedAt) {
    if (remoteUpdatedAt == null) {
      return true;
    }

    if (blogPost.getSourceUpdatedAt() == null) {
      return true;
    }

    return remoteUpdatedAt.isAfter(blogPost.getSourceUpdatedAt());
  }

  private String normalizeRepo(String value) {
    String normalized = value == null ? "" : value.trim();
    if (normalized.isEmpty()) {
      throw new BadRequestException("知识库 namespace 不能为空");
    }
    return normalized;
  }

  private List<String> normalizeTags(List<String> tags) {
    return tags.stream()
        .map(String::trim)
        .filter(tag -> !tag.isBlank())
        .distinct()
        .toList();
  }

  private LocalDate resolvePublishDate(Instant publishedAt) {
    Instant effectiveInstant = publishedAt == null ? Instant.now() : publishedAt;
    return effectiveInstant.atZone(ZoneOffset.UTC).toLocalDate();
  }

  private String normalizeBody(String body) {
    if (body == null || body.isBlank()) {
      throw new BadRequestException("语雀文档正文为空，暂时无法同步");
    }

    return body.trim();
  }

  private String extractSummary(String markdown, String description) {
    return BlogSummaryFormatter.fromMarkdown(markdown, description);
  }

  private String slugify(String slug, String title) {
    String source = slug != null && !slug.isBlank() ? slug : title;
    String normalized = source.toLowerCase(Locale.ROOT)
        .replaceAll("[^a-z0-9\\u4e00-\\u9fa5]+", "-")
        .replaceAll("^-+|-+$", "");

    return normalized.isBlank() ? "yuque-" + System.currentTimeMillis() : normalized;
  }

  private String formatInstant(Instant value) {
    return value == null ? null : DateTimeFormatter.ISO_INSTANT.format(value);
  }

  private String normalizeNullableUrl(String value) {
    if (value == null) {
      return null;
    }

    String normalized = value.trim();
    return normalized.isBlank() ? null : normalized;
  }

  private String firstNonBlank(String... values) {
    for (String value : values) {
      if (value != null && !value.isBlank()) {
        return value;
      }
    }
    return null;
  }
}
