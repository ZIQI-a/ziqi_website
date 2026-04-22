package com.ziqihome.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordConfig {

  @Bean
  public PasswordEncoder passwordEncoder() {
    // 统一注册密码编码器，后续登录校验与改密都复用同一套加密策略。
    return new BCryptPasswordEncoder();
  }
}
