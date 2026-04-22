package com.ziqihome.backend.dto.user;

/**
 * 统一维护用户密码校验规则，避免创建和改密两个 DTO 出现规则漂移。
 */
public final class UserPasswordRules {

  public static final String PATTERN = "^[\\p{Alnum}\\p{Punct}]{6}$";
  public static final String MESSAGE = "密码必须为 6 位，只能包含字母、数字或特殊字符，且不能包含空格";

  private UserPasswordRules() {
  }
}
