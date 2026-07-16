package com.ziqihome.backend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.ziqihome.backend.domain.UserRole;
import com.ziqihome.backend.dto.user.UserCreateRequest;
import com.ziqihome.backend.dto.user.UserPasswordRequest;
import com.ziqihome.backend.dto.user.UserUpdateRequest;
import com.ziqihome.backend.exception.ConflictException;
import com.ziqihome.backend.repository.UserRepository;
import com.ziqihome.backend.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class UserServiceTest {

  @Autowired
  private UserService userService;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @Test
  void createAndUpdatePasswordShouldStoreHashedPassword() {
    var operator = userService.createUser(new UserCreateRequest(
        "operator-admin",
        "o1@p2#",
        "操作管理员",
        UserRole.ADMIN,
        true
    ));
    var created = userService.createUser(new UserCreateRequest(
        "admin-user",
        "a1@b2#",
        "站点管理员",
        UserRole.ADMIN,
        true
    ));

    var saved = userRepository.findById(created.id()).orElseThrow();
    assertThat(saved.getPasswordHash()).isNotEqualTo("a1@b2#");
    assertThat(passwordEncoder.matches("a1@b2#", saved.getPasswordHash())).isTrue();

    var updated = userService.updateUser(created.id(), new UserUpdateRequest(
        "admin-user",
        "新昵称",
        UserRole.ADMIN,
        false
    ), operator.id());

    assertThat(updated.nickname()).isEqualTo("新昵称");
    assertThat(updated.enabled()).isFalse();

    userService.updatePassword(created.id(), new UserPasswordRequest("c3$d4%"));

    var passwordUpdated = userRepository.findById(created.id()).orElseThrow();
    assertThat(passwordEncoder.matches("c3$d4%", passwordUpdated.getPasswordHash())).isTrue();
  }

  @Test
  void passwordShouldAllowLettersNumbersAndSpecialCharacters() {
    var created = userService.createUser(new UserCreateRequest(
        "valid-password-user",
        "A1!b2@",
        "合法密码管理员",
        UserRole.ADMIN,
        true
    ));

    var saved = userRepository.findById(created.id()).orElseThrow();
    assertThat(passwordEncoder.matches("A1!b2@", saved.getPasswordHash())).isTrue();
  }

  @Test
  void createUserShouldRejectDuplicateUsername() {
    userService.createUser(new UserCreateRequest(
        "duplicate-admin",
        "e5&f6*",
        "管理员甲",
        UserRole.ADMIN,
        true
    ));

    assertThatThrownBy(() -> userService.createUser(new UserCreateRequest(
        "duplicate-admin",
        "g7(h8)",
        "管理员乙",
        UserRole.ADMIN,
        true
    )))
        .isInstanceOf(ConflictException.class)
        .hasMessage("账号已存在: duplicate-admin");
  }
}
