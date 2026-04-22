package com.ziqihome.backend;

import static org.assertj.core.api.Assertions.assertThat;

import com.ziqihome.backend.dto.moment.MomentCategoryRequest;
import com.ziqihome.backend.dto.moment.MomentRequest;
import com.ziqihome.backend.service.MomentCategoryService;
import com.ziqihome.backend.service.MomentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * moments service 测试主要验证分类关联、公开过滤和首页标记字段是否能稳定写入。
 */
@SpringBootTest
@ActiveProfiles("test")
class MomentServiceTest {

  @Autowired
  private MomentService momentService;

  @Autowired
  private MomentCategoryService momentCategoryService;

  @Test
  void createAndUpdateMomentShouldRespectPublishedFilterAndCategoryBinding() {
    Long lifeCategoryId = momentCategoryService.createCategory(
        new MomentCategoryRequest("生活")
    ).id();

    Long noteCategoryId = momentCategoryService.createCategory(
        new MomentCategoryRequest("随手记")
    ).id();

    var created = momentService.createMoment(new MomentRequest(
        "后端 moments 模块已接通。",
        "https://example.com/moment-cover.jpg",
        "moments 模块截图",
        lifeCategoryId,
        true,
        true,
        false
    ));

    assertThat(created.id()).isNotNull();
    assertThat(created.category().name()).isEqualTo("生活");
    assertThat(created.imageUrl()).isEqualTo("https://example.com/moment-cover.jpg");

    var updated = momentService.updateMoment(created.id(), new MomentRequest(
        "后端 moments 模块继续整理中。",
        null,
        null,
        noteCategoryId,
        false,
        false,
        true
    ));

    assertThat(updated.category().name()).isEqualTo("随手记");
    assertThat(updated.imageUrl()).isNull();
    assertThat(updated.pinned()).isTrue();
    assertThat(momentService.listPublishedMoments())
        .noneMatch(moment -> moment.id().equals(created.id()));
  }
}
