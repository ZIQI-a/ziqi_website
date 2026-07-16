package com.ziqihome.backend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ziqihome.backend.domain.UserRole;
import com.ziqihome.backend.dto.user.UserCreateRequest;
import com.ziqihome.backend.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MvcResult;

import com.ziqihome.backend.auth.AdminSessionKeys;

/**
 * 登录、获取当前用户和退出登录的闭环测试单独放在这里，避免 CRUD 测试混进鉴权断言。
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminAuthControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private UserService userService;

  @Test
  void loginMeAndLogoutShouldUseRealSessionFlow() throws Exception {
    userService.createUser(new UserCreateRequest(
        "real-admin",
        "a1@b2#",
        "真实管理员",
        UserRole.ADMIN,
        true
    ));

    String loginBody = """
        {
          "username": "real-admin",
          "password": "a1@b2#"
        }
        """;

    MvcResult loginResult = mockMvc.perform(post("/api/admin/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(loginBody))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.username").value("real-admin"))
        .andExpect(jsonPath("$.nickname").value("真实管理员"))
        .andReturn();

    mockMvc.perform(get("/api/admin/auth/me")
            .session((org.springframework.mock.web.MockHttpSession) loginResult.getRequest().getSession(false)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.username").value("real-admin"));

    mockMvc.perform(post("/api/admin/auth/logout")
            .session((org.springframework.mock.web.MockHttpSession) loginResult.getRequest().getSession(false)))
        .andExpect(status().isNoContent());
  }

  @Test
  void loginShouldReturnUnauthorizedWhenPasswordIsWrong() throws Exception {
    userService.createUser(new UserCreateRequest(
        "wrong-password-admin",
        "a1@b2#",
        "错误密码管理员",
        UserRole.ADMIN,
        true
    ));

    String loginBody = """
        {
          "username": "wrong-password-admin",
          "password": "wrong1"
        }
        """;

    mockMvc.perform(post("/api/admin/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(loginBody))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.message").value("账号或密码错误"));
  }

  @Test
  void userRoleShouldNotLoginToAdmin() throws Exception {
    userService.createUser(new UserCreateRequest(
        "community-user",
        "a1@b2#",
        "社区用户",
        UserRole.USER,
        true
    ));

    mockMvc.perform(post("/api/admin/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "username": "community-user",
                  "password": "a1@b2#"
                }
                """))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.message").value("当前账号没有后台管理权限"));
  }

  @Test
  void userRoleSessionShouldNotAccessAdminRoute() throws Exception {
    var user = userService.createUser(new UserCreateRequest(
        "community-session-user",
        "a1@b2#",
        "社区会话用户",
        UserRole.USER,
        true
    ));
    MockHttpSession session = new MockHttpSession();
    session.setAttribute(AdminSessionKeys.ADMIN_USER_ID, user.id());

    mockMvc.perform(get("/api/admin/users").session(session))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.message").value("登录状态已失效，请重新登录"));
  }

  @Test
  void adminRouteShouldReturnUnauthorizedWithoutSession() throws Exception {
    mockMvc.perform(get("/api/admin/users"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.message").value("请先登录后台账号"));
  }

  @Test
  void newMomentAdminRouteShouldReturnUnauthorizedWithoutSession() throws Exception {
    mockMvc.perform(get("/api/admin/moments"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.message").value("请先登录后台账号"));
  }
}
