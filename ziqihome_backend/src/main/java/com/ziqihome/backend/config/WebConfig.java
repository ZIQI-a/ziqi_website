package com.ziqihome.backend.config;

import com.ziqihome.backend.auth.AdminAuthInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  private final AdminAuthInterceptor adminAuthInterceptor;

  public WebConfig(AdminAuthInterceptor adminAuthInterceptor) {
    this.adminAuthInterceptor = adminAuthInterceptor;
  }

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
        .allowedOrigins("http://localhost:5173")
        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
        // 登录态依赖浏览器回传会话 Cookie，本地联调时必须显式允许携带凭证。
        .allowCredentials(true);
  }

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(adminAuthInterceptor)
        .addPathPatterns("/api/admin/**")
        // 登录、退出和获取当前用户属于鉴权入口本身，排除
        .excludePathPatterns("/api/admin/auth/**");
  }
}
