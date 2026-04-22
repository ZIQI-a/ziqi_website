package com.ziqihome.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;

/**
 * 登录只接收最小必要字段，避免把管理用户的完整 DTO 误用到鉴权流程。
 */
public record AuthLoginRequest(
    @NotBlank(message = "账号不能为空")
    String username,

    @NotBlank(message = "密码不能为空")
    String password
) {
}
