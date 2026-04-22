package com.ziqihome.backend.service;

import com.ziqihome.backend.domain.MomentCategory;
import com.ziqihome.backend.dto.moment.MomentCategoryRequest;
import com.ziqihome.backend.dto.moment.MomentCategoryResponse;
import com.ziqihome.backend.exception.ConflictException;
import com.ziqihome.backend.exception.ResourceNotFoundException;
import com.ziqihome.backend.mapper.MomentCategoryMapper;
import com.ziqihome.backend.repository.MomentCategoryRepository;
import com.ziqihome.backend.repository.MomentRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MomentCategoryService {

  private final MomentCategoryRepository momentCategoryRepository;
  private final MomentRepository momentRepository;
  private final MomentCategoryMapper momentCategoryMapper;

  public MomentCategoryService(
      MomentCategoryRepository momentCategoryRepository,
      MomentRepository momentRepository,
      MomentCategoryMapper momentCategoryMapper) {
    this.momentCategoryRepository = momentCategoryRepository;
    this.momentRepository = momentRepository;
    this.momentCategoryMapper = momentCategoryMapper;
  }

  /**
   * 查询所有动态分类列表，按名称升序排列
   * 
   * @return 动态分类响应对象列表
   */
  @Transactional(readOnly = true)
  public List<MomentCategoryResponse> listCategories() {
    return momentCategoryRepository.findAllByOrderByNameAsc()
        .stream()
        .map(momentCategoryMapper::toResponse)
        .toList();
  }

  public MomentCategoryResponse createCategory(MomentCategoryRequest request) {
    String normalizedName = request.name().trim();
    ensureCategoryNameAvailable(normalizedName, null);

    MomentCategory category = new MomentCategory();
    momentCategoryMapper.updateEntity(category, request);
    return momentCategoryMapper.toResponse(momentCategoryRepository.save(category));
  }

  public MomentCategoryResponse updateCategory(Long id, MomentCategoryRequest request) {
    String normalizedName = request.name().trim();
    ensureCategoryNameAvailable(normalizedName, id);

    MomentCategory category = getCategoryOrThrow(id);
    momentCategoryMapper.updateEntity(category, request);
    return momentCategoryMapper.toResponse(momentCategoryRepository.save(category));
  }

  public void deleteCategory(Long id) {
    MomentCategory category = getCategoryOrThrow(id);

    // 已被 moments 使用的分类不允许删除，避免历史内容失去归属。
    if (momentRepository.existsByCategoryId(id)) {
      throw new ConflictException("分类已被 moments 使用，无法删除: " + category.getName());
    }

    momentCategoryRepository.delete(category);
  }

  @Transactional(readOnly = true)
  public MomentCategory getCategoryEntity(Long id) {
    return getCategoryOrThrow(id);
  }

  /**
   * 确保分类名称可用（不存在重复）
   * 
   * @param name      分类名称
   * @param currentId 当前分类ID（更新时传入，创建时传入null）
   * @throws ConflictException 当分类名称已存在时抛出
   */
  private void ensureCategoryNameAvailable(String name, Long currentId) {
    boolean exists = currentId == null
        ? momentCategoryRepository.existsByName(name)
        : momentCategoryRepository.existsByNameAndIdNot(name, currentId);

    if (exists) {
      throw new ConflictException("分类已存在: " + name);
    }
  }

  /**
   * 根据ID获取动态分类，若不存在则抛出异常
   * 
   * @param id 动态分类ID
   * @return 找到的动态分类
   * @throws ResourceNotFoundException 当指定ID的动态分类不存在时抛出
   */
  private MomentCategory getCategoryOrThrow(Long id) {
    return momentCategoryRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("moment 分类不存在，id=" + id));
  }
}
