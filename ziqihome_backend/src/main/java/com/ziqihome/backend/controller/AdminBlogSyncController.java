package com.ziqihome.backend.controller;

import com.ziqihome.backend.dto.blogsync.YuqueSyncCommitRequest;
import com.ziqihome.backend.dto.blogsync.YuqueSyncCommitResponse;
import com.ziqihome.backend.dto.blogsync.YuqueSyncPreviewRequest;
import com.ziqihome.backend.dto.blogsync.YuqueSyncPreviewResponse;
import com.ziqihome.backend.service.YuqueSyncService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/blogs/yuque")
public class AdminBlogSyncController {

  private final YuqueSyncService yuqueSyncService;

  public AdminBlogSyncController(YuqueSyncService yuqueSyncService) {
    this.yuqueSyncService = yuqueSyncService;
  }

  @PostMapping("/preview")
  public YuqueSyncPreviewResponse preview(@Valid @RequestBody YuqueSyncPreviewRequest request) {
    return yuqueSyncService.preview(request);
  }

  @PostMapping("/sync")
  public YuqueSyncCommitResponse sync(@Valid @RequestBody YuqueSyncCommitRequest request) {
    return yuqueSyncService.sync(request);
  }
}
