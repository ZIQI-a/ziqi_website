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
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import com.ziqihome.backend.service.UserService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminContactLinkControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private UserService userService;

  @Test
  void adminCrudEndpointsShouldSupportCreateListAndDelete() throws Exception {
    MockHttpSession session = TestAdminSessionFactory.createAuthenticatedSession(userService);

    String requestBody = """
        {
          "platformName": "X",
          "profileUrl": "https://x.com/ziqi",
          "iconUrl": "https://example.com/icons/x.png",
          "description": "短内容更新和日常状态同步。",
          "published": true,
          "sortOrder": 6
        }
        """;

    String response = mockMvc.perform(post("/api/admin/contact-links")
            .session(session)
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.platformName").value("X"))
        .andReturn()
        .getResponse()
        .getContentAsString();

    String createdId = response.replaceAll(".*\"id\":(\\d+).*", "$1");

    mockMvc.perform(get("/api/admin/contact-links")
            .session(session))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[?(@.platformName=='X')]").exists());

    mockMvc.perform(get("/api/site/contact-links"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[?(@.platformName=='X')]").exists());

    mockMvc.perform(delete("/api/admin/contact-links/{id}", createdId)
            .session(session))
        .andExpect(status().isNoContent());
  }
}
