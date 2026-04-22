package com.ziqihome.backend.repository;

import com.ziqihome.backend.domain.MomentCategory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 分类管理当前只围绕名称唯一性和后台列表排序，保持查询接口尽量简单。
 */
public interface MomentCategoryRepository extends JpaRepository<MomentCategory, Long> {

  List<MomentCategory> findAllByOrderByNameAsc();

  boolean existsByName(String name);

  boolean existsByNameAndIdNot(String name, Long id);
}
