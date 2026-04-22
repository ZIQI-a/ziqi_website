package com.ziqihome.backend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ziqihome.backend.dto.moment.MomentCategoryRequest;
import com.ziqihome.backend.dto.moment.MomentRequest;
import com.ziqihome.backend.service.MomentCategoryService;
import com.ziqihome.backend.service.MomentService;
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
 * 分类控制器测试除了 CRUD，也会验证分类被 moments 引用时不能直接删除。
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminMomentCategoryControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private UserService userService;

  @Autowired
  private MomentCategoryService momentCategoryService;

  @Autowired
  private MomentService momentService;

  @Autowired
  private ObjectMapper objectMapper;

  @Test
  void categoryCrudShouldSupportCreateUpdateAndDelete() throws Exception {
    MockHttpSession session = TestAdminSessionFactory.createAuthenticatedSession(userService);

    String createBody = """
        {
          "name": "灵感"
        }
        """;

    String response = mockMvc.perform(post("/api/admin/moments/categories")
            .session(session)
            .contentType(MediaType.APPLICATION_JSON)
            .content(createBody))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.name").value("灵感"))
        .andReturn()
        .getResponse()
        .getContentAsString();

    // 分类当前没有嵌套 id，但这里统一使用 JSON 解析，避免以后响应结构变化时出错。
    long createdId = objectMapper.readTree(response).path("id").asLong();

    mockMvc.perform(get("/api/admin/moments/categories")
            .session(session))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[?(@.name=='灵感')]").exists());

    String updateBody = """
        {
          "name": "灵感记录"
        }
        """;

    mockMvc.perform(put("/api/admin/moments/categories/{id}", createdId)
            .session(session)
            .contentType(MediaType.APPLICATION_JSON)
            .content(updateBody))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("灵感记录"));

    mockMvc.perform(get("/api/site/moments/categories"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[?(@.name=='灵感记录')]").exists());

    mockMvc.perform(delete("/api/admin/moments/categories/{id}", createdId)
            .session(session))
        .andExpect(status().isNoContent());
  }

  @Test
  void deleteCategoryShouldReturnConflictWhenCategoryIsUsedByMoment() throws Exception {
    MockHttpSession session = TestAdminSessionFactory.createAuthenticatedSession(userService);

    Long categoryId = momentCategoryService.createCategory(
        new MomentCategoryRequest("占用分类")
    ).id();

    momentService.createMoment(new MomentRequest(
        "这条 moment 正在使用占用分类。",
        null,
        null,
        categoryId,
        true,
        true,
        false
    ));

    mockMvc.perform(delete("/api/admin/moments/categories/{id}", categoryId)
            .session(session))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.message").value("分类已被 moments 使用，无法删除: 占用分类"));
  }
}
