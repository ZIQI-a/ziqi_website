package com.ziqihome.backend.controller;

import com.ziqihome.backend.auth.AdminSessionKeys;
import com.ziqihome.backend.dto.user.UserCreateRequest;
import com.ziqihome.backend.dto.user.UserPasswordRequest;
import com.ziqihome.backend.dto.user.UserResponse;
import com.ziqihome.backend.dto.user.UserUpdateRequest;
import com.ziqihome.backend.service.UserService;
import com.ziqihome.backend.exception.UnauthorizedException;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
public class UserController {

  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping
  public List<UserResponse> listUsers() {
    // controller 只负责接收请求并转发给 service，不直接处理密码或唯一性规则。
    return userService.listUsers();
  }

  @GetMapping("/{id}")
  public UserResponse getUser(@PathVariable Long id) {
    return userService.getUser(id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public UserResponse createUser(@Valid @RequestBody UserCreateRequest request) {
    return userService.createUser(request);
  }

  @PutMapping("/{id}")
  public UserResponse updateUser(
      @PathVariable Long id,
      @Valid @RequestBody UserUpdateRequest request,
      HttpSession session
  ) {
    return userService.updateUser(id, request, getCurrentAdminId(session));
  }

  @PutMapping("/{id}/password")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void updatePassword(
      @PathVariable Long id,
      @Valid @RequestBody UserPasswordRequest request
  ) {
    // 密码修改单独走独立接口，避免普通资料保存时误覆盖敏感字段。
    userService.updatePassword(id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteUser(@PathVariable Long id, HttpSession session) {
    userService.deleteUser(id, getCurrentAdminId(session));
  }

  private Long getCurrentAdminId(HttpSession session) {
    Object userId = session.getAttribute(AdminSessionKeys.ADMIN_USER_ID);
    if (userId instanceof Long currentAdminId) {
      return currentAdminId;
    }
    // 正常请求会先经过拦截器；这里保留防御性校验，避免业务方法收到空操作者。
    throw new UnauthorizedException("请先登录后台账号");
  }
}
