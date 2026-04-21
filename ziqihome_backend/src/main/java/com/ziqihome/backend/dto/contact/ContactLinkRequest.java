package com.ziqihome.backend.dto.contact;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ContactLinkRequest(
        @NotBlank(message = "平台名不能为空") @Size(max = 80, message = "平台名长度不能超过 80") String platformName,

        @NotBlank(message = "主页链接不能为空") @Pattern(regexp = "https?://.+", message = "主页链接必须是 http 或 https URL") @Size(max = 255, message = "主页链接长度不能超过 255") String profileUrl,

        @NotBlank(message = "图标链接不能为空") @Size(max = 255, message = "图标链接长度不能超过 255") String iconUrl,

        @NotBlank(message = "描述不能为空") @Size(max = 300, message = "描述长度不能超过 300") String description,

        @NotNull(message = "发布状态不能为空") Boolean published,

        @NotNull(message = "排序值不能为空") Integer sortOrder) {
}
