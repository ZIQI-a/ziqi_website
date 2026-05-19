package com.ziqihome.backend.dto.blogsync;

import java.util.List;

public record YuqueSyncPreviewResponse(
    String repoNamespace,
    int totalCount,
    List<YuqueSyncPreviewItem> items
) {
}
