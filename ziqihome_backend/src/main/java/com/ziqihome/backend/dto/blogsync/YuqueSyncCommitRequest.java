package com.ziqihome.backend.dto.blogsync;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public record YuqueSyncCommitRequest(
    @NotBlank(message = "语雀 Token 不能为空")
    String token,

    @NotBlank(message = "知识库 namespace 不能为空")
    String repoNamespace,

    @NotEmpty(message = "至少选择一篇语雀文章")
    List<@Valid YuqueSyncSelectionRequest> selections,

    @NotBlank(message = "默认分类不能为空")
    @Size(max = 80, message = "默认分类长度不能超过 80")
    String defaultCategory,

    @Pattern(regexp = "^https?://.+$", message = "默认封面必须是 http 或 https URL")
    String defaultCover,

    @NotEmpty(message = "至少提供一个默认标签")
    List<@NotBlank(message = "默认标签不能为空") @Size(max = 60, message = "标签长度不能超过 60") String> defaultTags,

    @NotNull(message = "导入发布状态不能为空")
    Boolean publishImported
) {
}
