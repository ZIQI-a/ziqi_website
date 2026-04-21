package com.ziqihome.backend.dto.blog;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public record BlogPostRequest(
    @NotBlank(message = "slug 不能为空")
    @Size(max = 120, message = "slug 长度不能超过 120")
    String slug,

    @NotBlank(message = "标题不能为空")
    @Size(max = 150, message = "标题长度不能超过 150")
    String title,

    @NotNull(message = "发布日期不能为空")
    LocalDate publishDate,

    @NotBlank(message = "分类不能为空")
    @Size(max = 80, message = "分类长度不能超过 80")
    String category,

    @NotBlank(message = "摘要不能为空")
    @Size(max = 600, message = "摘要长度不能超过 600")
    String summary,

    @NotBlank(message = "封面地址不能为空")
    @Pattern(regexp = "https?://.+", message = "封面地址必须是 http 或 https URL")
    String cover,

    @NotEmpty(message = "至少保留一个标签")
    List<@NotBlank(message = "标签不能为空") @Size(max = 60, message = "标签长度不能超过 60") String> tags,

    @NotNull(message = "发布状态不能为空")
    Boolean published,

    @NotNull(message = "排序值不能为空")
    Integer sortOrder
) {
}
