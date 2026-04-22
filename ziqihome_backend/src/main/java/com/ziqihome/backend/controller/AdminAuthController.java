package com.ziqihome.backend.controller;

import com.ziqihome.backend.dto.auth.AuthLoginRequest;
import com.ziqihome.backend.dto.auth.AuthUserResponse;
import com.ziqihome.backend.service.AdminAuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * 管理端认证控制器，收口管理登录、获取当前用户、退出登录三个接口。
 *
 * 因为登录接口本身是在建立会话，而拦截器需要会话才能放行。
 * 拦截器的排除配置在 WebMvcConfig 中完成。
 */
@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

  private final AdminAuthService adminAuthService;

  public AdminAuthController(AdminAuthService adminAuthService) {
    this.adminAuthService = adminAuthService;
  }

  /**
   * 管理员登录
   * 
   * @param request 登录请求体（用户名 + 密码），@Valid 触发参数校验
   * @param session Spring 自动注入的当前 HTTP 会话
   * @return 登录成功后的用户信息
   */
  @PostMapping("/login")
  public AuthUserResponse login(
      @Valid @RequestBody AuthLoginRequest request,
      HttpSession session) {
    return adminAuthService.login(request, session);
  }

  /**
   * 获取当前已登录的管理员信息。
   * 
   * @param session 当前 HTTP 会话，从中读取已存储的管理员 ID
   * @return 当前登录用户信息
   */
  @GetMapping("/me")
  public AuthUserResponse getCurrentUser(HttpSession session) {
    return adminAuthService.getCurrentUser(session);
  }

  /**
   * 退出登录，销毁当前会话。
   *
   * <p>
   * 返回 204 No Content，表示操作成功但无响应体。
   *
   * @param session 当前 HTTP 会话，将被销毁
   */
  @PostMapping("/logout")
  @ResponseStatus(HttpStatus.NO_CONTENT) // HTTP 204，无响应体
  public void logout(HttpSession session) {
    adminAuthService.logout(session);
  }
}
