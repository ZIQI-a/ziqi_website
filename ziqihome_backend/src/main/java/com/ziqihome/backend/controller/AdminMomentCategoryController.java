package com.ziqihome.backend.controller;

import com.ziqihome.backend.dto.moment.MomentCategoryRequest;
import com.ziqihome.backend.dto.moment.MomentCategoryResponse;
import com.ziqihome.backend.service.MomentCategoryService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * moments 分类单独管理，便于后台先维护分类，再给 moments 表单提供稳定选项。
 */
@RestController
@RequestMapping("/api/admin/moments/categories")
public class AdminMomentCategoryController {

  private final MomentCategoryService momentCategoryService;

  public AdminMomentCategoryController(MomentCategoryService momentCategoryService) {
    this.momentCategoryService = momentCategoryService;
  }

  @GetMapping
  public List<MomentCategoryResponse> listCategories() {
    return momentCategoryService.listCategories();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public MomentCategoryResponse createCategory(
      @Valid @RequestBody MomentCategoryRequest request
  ) {
    return momentCategoryService.createCategory(request);
  }

  @PutMapping("/{id}")
  public MomentCategoryResponse updateCategory(
      @PathVariable Long id,
      @Valid @RequestBody MomentCategoryRequest request
  ) {
    return momentCategoryService.updateCategory(id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteCategory(@PathVariable Long id) {
    momentCategoryService.deleteCategory(id);
  }
}
