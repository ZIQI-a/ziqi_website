package com.ziqihome.backend.auth;

import com.ziqihome.backend.exception.UnauthorizedException;
import com.ziqihome.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 管理端接口统一依赖会话里的管理员 ID 放行，避免每个 controller 重复写登录判断。
 *
 * <p>作为 Spring MVC 拦截器，在请求到达 Controller 之前执行鉴权逻辑：
 * <ol>
 *   <li>从 Session 中读取管理员用户 ID</li>
 *   <li>校验用户是否存在且仍处于启用状态</li>
 *   <li>不满足条件则抛出 UnauthorizedException，阻止请求继续</li>
 * </ol>
 */
@Component // 注册为 Spring Bean，以便注入到拦截器注册配置中
public class AdminAuthInterceptor implements HandlerInterceptor {

  private final UserRepository userRepository;

  public AdminAuthInterceptor(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * 在 Controller 处理请求之前进行管理员身份校验。
   *
   * @param request  当前 HTTP 请求
   * @param response 当前 HTTP 响应
   * @param handler  即将执行的目标处理器（Controller 方法）
   * @return true 表示放行，false 表示拦截
   * @throws UnauthorizedException 未登录或登录已失效时抛出
   */
  @Override
  public boolean preHandle(
      HttpServletRequest request,
      HttpServletResponse response,
      Object handler
  ) {
    // 从已有 Session 中获取管理员用户 ID（不创建新 Session）
    Object userIdAttribute = request.getSession(false) == null
        ? null
        : request.getSession(false).getAttribute(AdminSessionKeys.ADMIN_USER_ID);

    // 如果 Session 不存在或其中没有管理员 ID，说明未登录
    // 使用 instanceof 模式匹配：类型匹配成功则自动拆箱为 Long userId
    if (!(userIdAttribute instanceof Long userId)) {
      throw new UnauthorizedException("请先登录后台账号");
    }

    // 每次进入管理接口都确认用户仍存在且仍启用，避免停用账号继续使用旧会话。
    boolean canAccess = userRepository.findById(userId)
        .map(user -> Boolean.TRUE.equals(user.getEnabled()))
        .orElse(false);

    if (!canAccess) {
      // 用户已被禁用或删除，销毁当前 Session 防止后续复用
      request.getSession(false).invalidate();
      throw new UnauthorizedException("登录状态已失效，请重新登录");
    }

    // 校验通过，放行请求
    return true;
  }
}
