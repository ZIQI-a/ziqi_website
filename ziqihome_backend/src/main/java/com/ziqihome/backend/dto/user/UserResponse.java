package com.ziqihome.backend.dto.user;

import com.ziqihome.backend.domain.UserRole;
import java.time.Instant;

/**
 * 对外响应明确排除 passwordHash，只暴露前端管理用户所需的安全字段。
 */
public record UserResponse(
    Long id,
    String username,
    String nickname,
    UserRole role,
    Boolean enabled,
    Instant lastLoginAt,
    Instant createdAt,
    Instant updatedAt
) {
}
