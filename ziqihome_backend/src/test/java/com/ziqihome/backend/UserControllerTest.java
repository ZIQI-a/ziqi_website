package com.ziqihome.backend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import com.ziqihome.backend.service.UserService;
import com.ziqihome.backend.auth.AdminSessionKeys;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private UserService userService;

  @Test
  void adminCrudEndpointsShouldSupportCreateUpdatePasswordAndDelete() throws Exception {
    MockHttpSession session = TestAdminSessionFactory.createAuthenticatedSession(userService);

    String createBody = """
        {
          "username": "controller-admin",
          "password": "a1@b2#",
          "nickname": "控制器管理员",
          "role": "ADMIN",
          "enabled": true
        }
        """;

    String response = mockMvc.perform(post("/api/admin/users")
            .session(session)
            .contentType(MediaType.APPLICATION_JSON)
            .content(createBody))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.username").value("controller-admin"))
        .andExpect(jsonPath("$.nickname").value("控制器管理员"))
        .andReturn()
        .getResponse()
        .getContentAsString();

    String createdId = response.replaceAll(".*\"id\":(\\d+).*", "$1");

    mockMvc.perform(get("/api/admin/users")
            .session(session))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[?(@.username=='controller-admin')]").exists());

    String updateBody = """
        {
          "username": "controller-admin",
          "nickname": "更新后管理员",
          "role": "ADMIN",
          "enabled": false
        }
        """;

    mockMvc.perform(put("/api/admin/users/{id}", createdId)
            .session(session)
            .contentType(MediaType.APPLICATION_JSON)
            .content(updateBody))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nickname").value("更新后管理员"))
        .andExpect(jsonPath("$.enabled").value(false));

    String passwordBody = """
        {
          "password": "c3$d4%"
        }
        """;

    mockMvc.perform(put("/api/admin/users/{id}/password", createdId)
            .session(session)
            .contentType(MediaType.APPLICATION_JSON)
            .content(passwordBody))
        .andExpect(status().isNoContent());

    mockMvc.perform(delete("/api/admin/users/{id}", createdId)
            .session(session))
        .andExpect(status().isNoContent());
  }

  @Test
  void createUserShouldReturnConflictWhenUsernameAlreadyExists() throws Exception {
    MockHttpSession session = TestAdminSessionFactory.createAuthenticatedSession(userService);

    String createBody = """
        {
          "username": "duplicate-controller-admin",
          "password": "e5&f6*",
          "nickname": "控制器管理员甲",
          "role": "ADMIN",
          "enabled": true
        }
        """;

    mockMvc.perform(post("/api/admin/users")
            .session(session)
            .contentType(MediaType.APPLICATION_JSON)
            .content(createBody))
        .andExpect(status().isCreated());

    mockMvc.perform(post("/api/admin/users")
            .session(session)
            .contentType(MediaType.APPLICATION_JSON)
            .content(createBody))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.message").value("账号已存在: duplicate-controller-admin"));
  }

  @Test
  void createUserShouldReturnBadRequestWhenPasswordContainsSpaces() throws Exception {
    MockHttpSession session = TestAdminSessionFactory.createAuthenticatedSession(userService);

    String createBody = """
        {
          "username": "space-password-admin",
          "password": "ab 12!",
          "nickname": "空格密码管理员",
          "role": "ADMIN",
          "enabled": true
        }
        """;

    mockMvc.perform(post("/api/admin/users")
            .session(session)
            .contentType(MediaType.APPLICATION_JSON)
            .content(createBody))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.fieldErrors.password")
            .value("密码长度最小6位，只能包含字母、数字或特殊字符，且不能包含空格"));
  }

  @Test
  void updatePasswordShouldReturnBadRequestWhenPasswordLengthIsNotSix() throws Exception {
    MockHttpSession session = TestAdminSessionFactory.createAuthenticatedSession(userService);

    String createBody = """
        {
          "username": "length-password-admin",
          "password": "z1!x2@",
          "nickname": "长度密码管理员",
          "role": "ADMIN",
          "enabled": true
        }
        """;

    String response = mockMvc.perform(post("/api/admin/users")
            .session(session)
            .contentType(MediaType.APPLICATION_JSON)
            .content(createBody))
        .andExpect(status().isCreated())
        .andReturn()
        .getResponse()
        .getContentAsString();

    String createdId = response.replaceAll(".*\"id\":(\\d+).*", "$1");

    String passwordBody = """
        {
          "password": "abc12"
        }
        """;

    mockMvc.perform(put("/api/admin/users/{id}/password", createdId)
            .session(session)
            .contentType(MediaType.APPLICATION_JSON)
            .content(passwordBody))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.fieldErrors.password")
            .value("密码长度最小6位，只能包含字母、数字或特殊字符，且不能包含空格"));
  }

  @Test
  void currentAdminShouldNotDisableOrDeleteItself() throws Exception {
    MockHttpSession session = TestAdminSessionFactory.createAuthenticatedSession(userService);
    Long currentAdminId = (Long) session.getAttribute(AdminSessionKeys.ADMIN_USER_ID);

    mockMvc.perform(put("/api/admin/users/{id}", currentAdminId)
            .session(session)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "username": "session-admin",
                  "nickname": "当前管理员",
                  "role": "ADMIN",
                  "enabled": false
                }
                """))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.message").value("不能停用当前登录的管理员账号"));

    mockMvc.perform(delete("/api/admin/users/{id}", currentAdminId).session(session))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.message").value("不能删除当前登录的管理员账号"));
  }
}
