package com.ziqihome.backend.dto.blogsync;

import java.util.List;

public record YuqueSyncCommitResponse(
    int createdCount,
    int updatedCount,
    List<YuqueSyncResultItem> items
) {
}
