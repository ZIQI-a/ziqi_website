package com.ziqihome.backend.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * 密码更新单独走一个 DTO，明确这是敏感操作。
 */
public record UserPasswordRequest(
    @NotBlank(message = "密码不能为空")
    @Pattern(regexp = UserPasswordRules.PATTERN, message = UserPasswordRules.MESSAGE)
    String password
) {
}
