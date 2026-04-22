package com.ziqihome.backend.dto.moment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * moment 创建和编辑共用同一份请求体，保持管理端表单字段契约稳定。
 */
public record MomentRequest(
    @NotBlank(message = "内容不能为空")
    @Size(max = 1200, message = "内容长度不能超过 1200")
    String content,

    @Pattern(regexp = "https?://.+", message = "图片链接必须是 http 或 https URL")
    @Size(max = 255, message = "图片链接长度不能超过 255")
    String imageUrl,

    @Size(max = 160, message = "图片说明长度不能超过 160")
    String imageAlt,

    @NotNull(message = "分类不能为空")
    Long categoryId,

    @NotNull(message = "发布状态不能为空")
    Boolean published,

    @NotNull(message = "首页展示状态不能为空")
    Boolean showOnHome,

    @NotNull(message = "置顶状态不能为空")
    Boolean pinned
) {
}
