package com.ziqihome.backend;

import static org.assertj.core.api.Assertions.assertThat;

import com.ziqihome.backend.dto.contact.ContactLinkRequest;
import com.ziqihome.backend.service.ContactLinkService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ContactLinkServiceTest {

  @Autowired
  private ContactLinkService contactLinkService;

  @Test
  void createAndUpdateContactLinkShouldRespectPublishedFilter() {
    ContactLinkRequest createRequest = new ContactLinkRequest(
        "GitHub",
        "https://github.com/ziqi",
        "https://example.com/github.png",
        "放项目代码和学习过程记录。",
        true,
        5
    );

    var created = contactLinkService.createContactLink(createRequest);
    assertThat(created.id()).isNotNull();
    assertThat(created.platformName()).isEqualTo("GitHub");

    ContactLinkRequest updateRequest = new ContactLinkRequest(
        "GitHub",
        "https://github.com/ziqi-home",
        "https://example.com/github-mark.png",
        "统一整理代码仓库和实验项目入口。",
        false,
        2
    );

    var updated = contactLinkService.updateContactLink(created.id(), updateRequest);
    assertThat(updated.profileUrl()).isEqualTo("https://github.com/ziqi-home");
    assertThat(updated.iconUrl()).isEqualTo("https://example.com/github-mark.png");
    assertThat(updated.published()).isFalse();
    assertThat(contactLinkService.listPublishedContactLinks())
        .noneMatch(contactLink -> contactLink.id().equals(created.id()));
  }
}
