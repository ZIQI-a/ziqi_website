package com.ziqihome.backend.repository;

import com.ziqihome.backend.domain.User;
import com.ziqihome.backend.domain.UserRole;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 用户查询当前只围绕账号唯一性和基础 CRUD，后续登录会继续复用这层查询入口。
 */
public interface UserRepository extends JpaRepository<User, Long> {

  Optional<User> findByUsername(String username);

  boolean existsByUsername(String username);

  boolean existsByUsernameAndIdNot(String username, Long id);

  long countByRoleAndEnabledTrue(UserRole role);
}
