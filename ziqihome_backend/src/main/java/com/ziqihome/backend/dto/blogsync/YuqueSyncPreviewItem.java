package com.ziqihome.backend.dto.blogsync;

public record YuqueSyncPreviewItem(
    String docId,
    String slug,
    String title,
    String summary,
    String url,
    String updatedAt,
    String recommendedAction,
    Long existingBlogId,
    String existingBlogTitle
) {
}
