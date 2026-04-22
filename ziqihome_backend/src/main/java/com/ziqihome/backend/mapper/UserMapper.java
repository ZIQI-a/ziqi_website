package com.ziqihome.backend.mapper;

import com.ziqihome.backend.domain.User;
import com.ziqihome.backend.dto.user.UserCreateRequest;
import com.ziqihome.backend.dto.user.UserResponse;
import com.ziqihome.backend.dto.user.UserUpdateRequest;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

  public UserResponse toResponse(User user) {
    return new UserResponse(
        user.getId(),
        user.getUsername(),
        user.getNickname(),
        user.getRole(),
        user.getEnabled(),
        user.getLastLoginAt(),
        user.getCreatedAt(),
        user.getUpdatedAt()
    );
  }

  public void applyCreateRequest(User user, UserCreateRequest request) {
    user.setUsername(request.username().trim());
    user.setNickname(request.nickname().trim());
    user.setRole(request.role());
    user.setEnabled(request.enabled());
  }

  public void applyUpdateRequest(User user, UserUpdateRequest request) {
    // 普通资料更新不触碰密码，避免把敏感字段混进通用更新流程。
    user.setUsername(request.username().trim());
    user.setNickname(request.nickname().trim());
    user.setRole(request.role());
    user.setEnabled(request.enabled());
  }
}
