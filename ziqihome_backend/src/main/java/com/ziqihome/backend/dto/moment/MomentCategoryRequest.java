package com.ziqihome.backend.dto.moment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 分类当前只维护名称，先把最小可用输入模型做稳定。
 */
public record MomentCategoryRequest(
    @NotBlank(message = "分类名称不能为空")
    @Size(max = 40, message = "分类名称长度不能超过 40")
    String name
) {
}
