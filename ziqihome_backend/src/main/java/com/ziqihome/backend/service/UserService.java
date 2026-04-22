package com.ziqihome.backend.service;

import com.ziqihome.backend.domain.User;
import com.ziqihome.backend.dto.user.UserCreateRequest;
import com.ziqihome.backend.dto.user.UserPasswordRequest;
import com.ziqihome.backend.dto.user.UserResponse;
import com.ziqihome.backend.dto.user.UserUpdateRequest;
import com.ziqihome.backend.exception.ConflictException;
import com.ziqihome.backend.exception.ResourceNotFoundException;
import com.ziqihome.backend.mapper.UserMapper;
import com.ziqihome.backend.repository.UserRepository;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

  private final UserRepository userRepository;
  private final UserMapper userMapper;
  private final PasswordEncoder passwordEncoder;

  public UserService(
      UserRepository userRepository,
      UserMapper userMapper,
      PasswordEncoder passwordEncoder
  ) {
    this.userRepository = userRepository;
    this.userMapper = userMapper;
    this.passwordEncoder = passwordEncoder;
  }

  @Transactional(readOnly = true)
  public List<UserResponse> listUsers() {
    // 用户列表只返回脱敏后的响应 DTO，避免把实体直接暴露到接口层。
    return userRepository.findAll()
        .stream()
        .map(userMapper::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public UserResponse getUser(Long id) {
    return userMapper.toResponse(getUserOrThrow(id));
  }

  public UserResponse createUser(UserCreateRequest request) {
    String normalizedUsername = request.username().trim();
    ensureUsernameAvailable(normalizedUsername, null);

    User user = new User();
    userMapper.applyCreateRequest(user, request);
    // 密码必须按用户输入原样加密，不能静默裁剪空白，否则登录口令会和用户认知不一致。
    user.setPasswordHash(passwordEncoder.encode(request.password()));

    return userMapper.toResponse(saveUserWithConflictHandling(user, normalizedUsername));
  }

  public UserResponse updateUser(Long id, UserUpdateRequest request) {
    User user = getUserOrThrow(id);
    String normalizedUsername = request.username().trim();
    ensureUsernameAvailable(normalizedUsername, id);
    userMapper.applyUpdateRequest(user, request);
    return userMapper.toResponse(saveUserWithConflictHandling(user, normalizedUsername));
  }

  public void updatePassword(Long id, UserPasswordRequest request) {
    User user = getUserOrThrow(id);
    // 密码更新和普通资料更新拆开后，前端流程会更清晰，也更不容易误操作。
    user.setPasswordHash(passwordEncoder.encode(request.password()));
    userRepository.save(user);
  }

  public void deleteUser(Long id) {
    userRepository.delete(getUserOrThrow(id));
  }

  @Transactional(readOnly = true)
  public User getUserEntity(Long id) {
    // 登录态和拦截器在少量场景下需要直接读取用户实体，这里统一走同一个查找入口。
    return getUserOrThrow(id);
  }

  private void ensureUsernameAvailable(String username, Long currentId) {
    // 创建和编辑都要复用账号唯一性校验，避免规则分散在多个接口分支里。
    boolean exists = currentId == null
        ? userRepository.existsByUsername(username)
        : userRepository.existsByUsernameAndIdNot(username, currentId);

    if (exists) {
      throw new ConflictException("账号已存在: " + username);
    }
  }

  private User saveUserWithConflictHandling(User user, String username) {
    try {
      return userRepository.save(user);
    } catch (DataIntegrityViolationException exception) {
      // 即使前置查重已通过，并发写入仍可能撞上数据库唯一索引，这里统一转成 409。
      throw new ConflictException("账号已存在: " + username);
    }
  }

  private User getUserOrThrow(Long id) {
    return userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("用户不存在，id=" + id));
  }
}
