package com.ziqihome.backend.controller;

import com.ziqihome.backend.exception.ConflictException;
import com.ziqihome.backend.exception.ResourceNotFoundException;
import com.ziqihome.backend.exception.UnauthorizedException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理器 —— 拦截 Controller 层抛出的异常，统一转换为结构化 JSON 响应。
 *
 * <p>
 * 响应体统一格式：{ timestamp, status, message, ...额外字段 }
 *
 */
@RestControllerAdvice // 对所有 @RestController 生效的 AOP 切面
public class ApiExceptionHandler {

  /** 资源未找到 → 404 Not Found */
  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException exception) {
    return buildResponse(HttpStatus.NOT_FOUND, exception.getMessage(), Map.of());
  }

  /** 业务冲突（如重复创建）→ 409 Conflict */
  @ExceptionHandler(ConflictException.class)
  public ResponseEntity<Map<String, Object>> handleConflict(ConflictException exception) {
    return buildResponse(HttpStatus.CONFLICT, exception.getMessage(), Map.of());
  }

  /** 未认证 / 登录失效 → 401 Unauthorized */
  @ExceptionHandler(UnauthorizedException.class)
  public ResponseEntity<Map<String, Object>> handleUnauthorized(UnauthorizedException exception) {
    return buildResponse(HttpStatus.UNAUTHORIZED, exception.getMessage(), Map.of());
  }

  /**
   * 数据库约束冲突（如唯一索引重复）→ 409 Conflict。
   *
   * <p>
   * 兜住 Service 层未显式捕获的 DataIntegrityViolationException，
   * 避免暴露不稳定的 500 错误或数据库字段名等敏感信息给前端。
   */
  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(
      DataIntegrityViolationException exception) {
    return buildResponse(HttpStatus.CONFLICT, "数据冲突，请检查唯一字段是否重复", Map.of());
  }

  /**
   * @Valid 参数校验失败 → 400 Bad Request。
   *
   *        <p>
   *        将所有字段校验错误收集为 { 字段名 → 错误提示 } 的 Map，
   *        附加到响应体的 fieldErrors 字段，便于前端逐字段高亮提示。
   */
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException exception) {
    // 收集所有字段校验错误：字段名 → 默认错误消息
    Map<String, String> fieldErrors = exception.getBindingResult()
        .getFieldErrors()
        .stream()
        .collect(Collectors.toMap(
            FieldError::getField, // key: 字段名
            FieldError::getDefaultMessage, // value: 校验注解上的消息
            (left, right) -> left, // 同一字段多条错误只保留第一条
            LinkedHashMap::new // 保持字段出现顺序
        ));

    return buildResponse(HttpStatus.BAD_REQUEST, "请求参数校验失败", Map.of("fieldErrors", fieldErrors));
  }

  /**
   * 构造统一格式的错误响应体。
   *
   * @param status  HTTP 状态码
   * @param message 人类可读的错误摘要
   * @param extra   额外附加字段（如 fieldErrors），无额外字段时传 Map.of()
   * @return 结构化的 ResponseEntity
   */
  private ResponseEntity<Map<String, Object>> buildResponse(
      HttpStatus status,
      String message,
      Map<String, Object> extra) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", Instant.now().toString()); // ISO-8601 时间戳
    body.put("status", status.value()); // 数值型状态码（如 404）
    body.put("message", message); // 错误摘要
    body.putAll(extra); // 合并额外字段
    return ResponseEntity.status(status).body(body);
  }
}
