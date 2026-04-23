package com.ziqihome.backend.service;

import com.ziqihome.backend.domain.Moment;
import com.ziqihome.backend.domain.MomentCategory;
import com.ziqihome.backend.dto.moment.MomentRequest;
import com.ziqihome.backend.dto.moment.MomentResponse;
import com.ziqihome.backend.exception.ResourceNotFoundException;
import com.ziqihome.backend.mapper.MomentMapper;
import com.ziqihome.backend.repository.MomentRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MomentService {

  private final MomentRepository momentRepository;
  private final MomentCategoryService momentCategoryService;
  private final MomentMapper momentMapper;

  public MomentService(
      MomentRepository momentRepository,
      MomentCategoryService momentCategoryService,
      MomentMapper momentMapper
  ) {
    this.momentRepository = momentRepository;
    this.momentCategoryService = momentCategoryService;
    this.momentMapper = momentMapper;
  }

  @Transactional(readOnly = true)
  public List<MomentResponse> listAdminMoments() {
    return listAdminMoments(null, null);
  }

  @Transactional(readOnly = true)
  public List<MomentResponse> listAdminMoments(Long categoryId, Boolean published) {
    return momentRepository.findAdminMoments(categoryId, published)
        .stream()
        .map(momentMapper::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<MomentResponse> listPublishedMoments() {
    return listPublishedMoments(null, null, null);
  }

  @Transactional(readOnly = true)
  public List<MomentResponse> listPublishedMoments(
      Long categoryId,
      Boolean showOnHome,
      Boolean hasImage
  ) {
    // 公开站接口永远只返回已发布内容，筛选条件只影响已发布集合的范围。
    return momentRepository.findSiteMoments(categoryId, showOnHome, hasImage)
        .stream()
        .map(momentMapper::toResponse)
        .toList();
  }

  public MomentResponse createMoment(MomentRequest request) {
    MomentCategory category = momentCategoryService.getCategoryEntity(request.categoryId());

    Moment moment = new Moment();
    momentMapper.updateEntity(moment, request, category);
    return momentMapper.toResponse(momentRepository.save(moment));
  }

  public MomentResponse updateMoment(Long id, MomentRequest request) {
    MomentCategory category = momentCategoryService.getCategoryEntity(request.categoryId());
    Moment moment = getMomentOrThrow(id);
    momentMapper.updateEntity(moment, request, category);
    return momentMapper.toResponse(momentRepository.save(moment));
  }

  public void deleteMoment(Long id) {
    momentRepository.delete(getMomentOrThrow(id));
  }

  private Moment getMomentOrThrow(Long id) {
    return momentRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("moment 不存在，id=" + id));
  }
}
