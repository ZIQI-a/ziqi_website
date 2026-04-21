package com.ziqihome.backend;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminProjectControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  void adminCrudEndpointsShouldSupportCreateListAndDelete() throws Exception {
    String requestBody = """
        {
          "slug": "controller-test-project",
          "name": "Controller Test Project",
          "description": "验证项目管理接口的新增、查询与删除。",
          "status": "开发中",
          "cover": "https://example.com/project-cover.jpg",
          "link": "https://example.com/project",
          "stack": ["React", "Spring Boot"],
          "highlights": ["列表管理", "接口联调"],
          "published": true,
          "sortOrder": 8
        }
        """;

    String response = mockMvc.perform(post("/api/admin/projects")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.slug").value("controller-test-project"))
        .andReturn()
        .getResponse()
        .getContentAsString();

    String createdId = response.replaceAll(".*\"id\":(\\d+).*", "$1");

    mockMvc.perform(get("/api/admin/projects"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[?(@.slug=='controller-test-project')]").exists());

    mockMvc.perform(delete("/api/admin/projects/{id}", createdId))
        .andExpect(status().isNoContent());
  }

  @Test
  void optionsEndpointShouldReturnStatusAndStackCandidates() throws Exception {
    String requestBody = """
        {
          "slug": "options-test-project",
          "name": "Options Test Project",
          "description": "验证项目表单可选项接口。",
          "status": "开发中",
          "cover": "https://example.com/options-cover.jpg",
          "link": "",
          "stack": ["React", "TypeScript"],
          "highlights": ["选项拉取"],
          "published": true,
          "sortOrder": 3
        }
        """;

    String response = mockMvc.perform(post("/api/admin/projects")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody))
        .andExpect(status().isCreated())
        .andReturn()
        .getResponse()
        .getContentAsString();

    String createdId = response.replaceAll(".*\"id\":(\\d+).*", "$1");

    mockMvc.perform(get("/api/admin/projects/options"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.statusOptions").isArray())
        .andExpect(jsonPath("$.statusOptions[0]").value("构思中"))
        .andExpect(jsonPath("$.statusOptions[1]").value("开发中"))
        .andExpect(jsonPath("$.statusOptions[2]").value("已完成"))
        .andExpect(jsonPath("$.statusOptions[3]").value("已发布"))
        .andExpect(jsonPath("$.stackOptions").isArray())
        .andExpect(jsonPath("$..stackOptions[?(@=='React')]").exists())
        .andExpect(jsonPath("$..stackOptions[?(@=='TypeScript')]").exists());

    mockMvc.perform(delete("/api/admin/projects/{id}", createdId))
        .andExpect(status().isNoContent());
  }
}
