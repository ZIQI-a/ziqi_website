package com.ziqihome.backend.dto.blogsync;

import jakarta.validation.constraints.NotBlank;

public record YuqueSyncSelectionRequest(
    @NotBlank(message = "语雀文档 ID 不能为空")
    String docId,

    @NotBlank(message = "语雀文档 slug 不能为空")
    String slug
) {
}
