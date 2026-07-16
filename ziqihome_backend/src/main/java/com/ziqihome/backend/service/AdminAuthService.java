package com.ziqihome.backend.service;

import com.ziqihome.backend.auth.AdminSessionKeys;
import com.ziqihome.backend.domain.User;
import com.ziqihome.backend.domain.UserRole;
import com.ziqihome.backend.dto.auth.AuthLoginRequest;
import com.ziqihome.backend.dto.auth.AuthUserResponse;
import com.ziqihome.backend.exception.UnauthorizedException;
import com.ziqihome.backend.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import java.time.Instant;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 后台登录流程统一集中在这里，避免控制器直接操作密码比对和会话写入。
 */
@Service
@Transactional
public class AdminAuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public AdminAuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  public AuthUserResponse login(AuthLoginRequest request, HttpSession session) {
    User user = userRepository.findByUsername(request.username().trim())
        .orElseThrow(() -> new UnauthorizedException("账号或密码错误"));

    // 登录校验统一在 service 层做，避免控制器分散处理密码比对和账号状态判断。
    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      throw new UnauthorizedException("账号或密码错误");
    }

    if (!Boolean.TRUE.equals(user.getEnabled())) {
      throw new UnauthorizedException("账号已停用，无法登录");
    }

    // USER 为后续社区账号预留；当前管理后台只允许 ADMIN 建立管理会话。
    if (user.getRole() != UserRole.ADMIN) {
      throw new UnauthorizedException("当前账号没有后台管理权限");
    }

    user.setLastLoginAt(Instant.now());
    User savedUser = userRepository.save(user);
    session.setAttribute(AdminSessionKeys.ADMIN_USER_ID, savedUser.getId());

    return toAuthUserResponse(savedUser);
  }

  @Transactional(readOnly = true)
  public AuthUserResponse getCurrentUser(HttpSession session) {
    Object userIdAttribute = session.getAttribute(AdminSessionKeys.ADMIN_USER_ID);

    if (!(userIdAttribute instanceof Long userId)) {
      throw new UnauthorizedException("当前未登录后台账号");
    }

    User user = userRepository.findById(userId)
        .orElseThrow(() -> new UnauthorizedException("登录状态已失效，请重新登录"));

    if (!Boolean.TRUE.equals(user.getEnabled())) {
      throw new UnauthorizedException("账号已停用，无法继续访问");
    }

    // /auth/me 不经过管理拦截器，因此这里也必须独立校验管理员角色。
    if (user.getRole() != UserRole.ADMIN) {
      throw new UnauthorizedException("当前账号没有后台管理权限");
    }

    return toAuthUserResponse(user);
  }

  public void logout(HttpSession session) {
    session.invalidate();
  }

  private AuthUserResponse toAuthUserResponse(User user) {
    return new AuthUserResponse(
        user.getId(),
        user.getUsername(),
        user.getNickname(),
        user.getRole(),
        user.getEnabled(),
        user.getLastLoginAt());
  }
}
