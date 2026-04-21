package com.ziqihome.backend.dto.project;

import com.ziqihome.backend.domain.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ProjectRequest(
    @NotBlank(message = "slug 不能为空")
    @Size(max = 120, message = "slug 长度不能超过 120")
    String slug,

    @NotBlank(message = "项目名称不能为空")
    @Size(max = 150, message = "项目名称长度不能超过 150")
    String name,

    @NotBlank(message = "项目描述不能为空")
    @Size(max = 600, message = "项目描述长度不能超过 600")
    String description,

    @NotNull(message = "状态不能为空")
    ProjectStatus status,

    @NotBlank(message = "封面地址不能为空")
    @Pattern(regexp = "https?://.+", message = "封面地址必须是 http 或 https URL")
    String cover,

    @Pattern(regexp = "^$|https?://.+", message = "项目链接必须为空或 http/https URL")
    String link,

    @NotEmpty(message = "至少保留一项技术栈")
    List<@NotBlank(message = "技术栈不能为空") @Size(max = 60, message = "技术栈长度不能超过 60") String> stack,

    @NotEmpty(message = "至少保留一个亮点")
    List<@NotBlank(message = "亮点不能为空") @Size(max = 120, message = "亮点长度不能超过 120") String> highlights,

    @NotNull(message = "发布状态不能为空")
    Boolean published,

    @NotNull(message = "排序值不能为空")
    Integer sortOrder
) {
}
