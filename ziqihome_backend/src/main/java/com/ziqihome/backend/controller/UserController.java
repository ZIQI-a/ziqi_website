package com.ziqihome.backend.controller;

import com.ziqihome.backend.dto.user.UserCreateRequest;
import com.ziqihome.backend.dto.user.UserPasswordRequest;
import com.ziqihome.backend.dto.user.UserResponse;
import com.ziqihome.backend.dto.user.UserUpdateRequest;
import com.ziqihome.backend.service.UserService;
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
      @Valid @RequestBody UserUpdateRequest request
  ) {
    return userService.updateUser(id, request);
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
  public void deleteUser(@PathVariable Long id) {
    userService.deleteUser(id);
  }
}
