package com.ziqihome.backend.dto.blogsync;

import jakarta.validation.constraints.NotBlank;

public record YuqueSyncPreviewRequest(
    @NotBlank(message = "语雀 Token 不能为空")
    String token,

    @NotBlank(message = "知识库 namespace 不能为空")
    String repoNamespace
) {
}
