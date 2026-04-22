package com.ziqihome.backend.auth;

/**
 * 会话字段集中管理，避免字符串字面量散落在 controller、service 和测试里。
 */
public final class AdminSessionKeys {

  public static final String ADMIN_USER_ID = "adminUserId";

  private AdminSessionKeys() {
  }
}
