package com.ziqihome.backend.exception;

/**
 * 管理端接口统一抛 401 时使用的异常，避免在拦截器和控制器里重复手写响应体。
 */
public class UnauthorizedException extends RuntimeException {

  public UnauthorizedException(String message) {
    super(message);
  }
}
