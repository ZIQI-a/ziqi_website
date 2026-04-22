package com.ziqihome.backend.dto.auth;

import com.ziqihome.backend.domain.UserRole;
import java.time.Instant;

/**
 * 登录态接口只返回当前会话判断所需信息，不暴露管理页无关字段。
 */
public record AuthUserResponse(
    Long id,
    String username,
    String nickname,
    UserRole role,
    Boolean enabled,
    Instant lastLoginAt
) {
}
