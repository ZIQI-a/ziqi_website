package com.ziqihome.backend.dto.blogsync;

public record YuqueSyncResultItem(
    Long blogId,
    String blogTitle,
    String action,
    String sourceDocId
) {
}
