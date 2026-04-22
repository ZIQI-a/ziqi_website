package com.ziqihome.backend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ziqihome.backend.dto.moment.MomentCategoryRequest;
import com.ziqihome.backend.service.MomentCategoryService;
import com.ziqihome.backend.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * moments 控制器测试同时覆盖管理端 CRUD 和公开接口发布过滤，保证前后端联调用的主路径稳定。
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminMomentControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private UserService userService;

  @Autowired
  private MomentCategoryService momentCategoryService;

  @Autowired
  private ObjectMapper objectMapper;

  @Test
  void adminCrudEndpointsShouldSupportCreateUpdateListAndDelete() throws Exception {
    MockHttpSession session = TestAdminSessionFactory.createAuthenticatedSession(userService);

    Long categoryId = momentCategoryService.createCategory(
        new MomentCategoryRequest("学习")
    ).id();

    String createBody = """
        {
          "content": "管理端新建了一条图文 moment。",
          "imageUrl": "https://example.com/moment-create.jpg",
          "imageAlt": "moment 创建图",
          "categoryId": %d,
          "published": true,
          "showOnHome": true,
          "pinned": false
        }
        """.formatted(categoryId);

    String response = mockMvc.perform(post("/api/admin/moments")
            .session(session)
            .contentType(MediaType.APPLICATION_JSON)
            .content(createBody))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.category.name").value("学习"))
        .andReturn()
        .getResponse()
        .getContentAsString();

    // 用 JSON 解析根节点 id，避免被嵌套 category.id 干扰。
    long createdId = objectMapper.readTree(response).path("id").asLong();

    mockMvc.perform(get("/api/admin/moments")
            .session(session))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[?(@.content=='管理端新建了一条图文 moment。')]").exists());

    String updateBody = """
        {
          "content": "管理端把这条 moment 改成文字版。",
          "imageUrl": null,
          "imageAlt": null,
          "categoryId": %d,
          "published": false,
          "showOnHome": false,
          "pinned": true
        }
        """.formatted(categoryId);

    mockMvc.perform(put("/api/admin/moments/{id}", createdId)
            .session(session)
            .contentType(MediaType.APPLICATION_JSON)
            .content(updateBody))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.imageUrl").isEmpty())
        .andExpect(jsonPath("$.pinned").value(true));

    mockMvc.perform(get("/api/site/moments"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[?(@.content=='管理端把这条 moment 改成文字版。')]").doesNotExist());

    mockMvc.perform(delete("/api/admin/moments/{id}", createdId)
            .session(session))
        .andExpect(status().isNoContent());
  }
}
