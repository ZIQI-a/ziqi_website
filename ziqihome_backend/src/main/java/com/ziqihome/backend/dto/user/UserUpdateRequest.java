package com.ziqihome.backend.dto.user;

import com.ziqihome.backend.domain.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 普通资料更新不包含密码，避免前端在编辑昵称、角色时误覆盖密码。
 */
public record UserUpdateRequest(
    @NotBlank(message = "账号不能为空")
    @Size(max = 80, message = "账号长度不能超过 80")
    String username,

    @NotBlank(message = "昵称不能为空")
    @Size(max = 80, message = "昵称长度不能超过 80")
    String nickname,

    @NotNull(message = "角色不能为空")
    UserRole role,

    @NotNull(message = "启用状态不能为空")
    Boolean enabled
) {
}
