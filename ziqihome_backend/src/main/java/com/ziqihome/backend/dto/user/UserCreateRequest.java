package com.ziqihome.backend.dto.user;

import com.ziqihome.backend.domain.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 创建用户时单独接收明文密码，service 内部负责加密，不让 controller 处理敏感逻辑。
 */
public record UserCreateRequest(
    @NotBlank(message = "账号不能为空")
    @Size(max = 80, message = "账号长度不能超过 80")
    String username,

    @NotBlank(message = "密码不能为空")
    @Pattern(regexp = UserPasswordRules.PATTERN, message = UserPasswordRules.MESSAGE)
    String password,

    @NotBlank(message = "昵称不能为空")
    @Size(max = 80, message = "昵称长度不能超过 80")
    String nickname,

    @NotNull(message = "角色不能为空")
    UserRole role,

    @NotNull(message = "启用状态不能为空")
    Boolean enabled
) {
}
