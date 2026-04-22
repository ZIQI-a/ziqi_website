package com.ziqihome.backend;

import com.ziqihome.backend.auth.AdminSessionKeys;
import com.ziqihome.backend.domain.UserRole;
import com.ziqihome.backend.dto.user.UserCreateRequest;
import com.ziqihome.backend.service.UserService;
import org.springframework.mock.web.MockHttpSession;

/**
 * 管理端接口测试统一通过这个工厂创建登录会话，避免每个测试类重复拼装管理员账号。
 */
public final class TestAdminSessionFactory {

  private TestAdminSessionFactory() {
  }

  public static MockHttpSession createAuthenticatedSession(UserService userService) {
    String username = "test-admin-" + System.nanoTime();

    var createdUser = userService.createUser(new UserCreateRequest(
        username,
        "a1@b2#",
        "测试管理员",
        UserRole.ADMIN,
        true
    ));

    MockHttpSession session = new MockHttpSession();
    session.setAttribute(AdminSessionKeys.ADMIN_USER_ID, createdUser.id());
    return session;
  }
}
