import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { siteClient } from "../api/siteClient";
import type { ContactLinkSummary } from "../types/content";
import styles from "./MainLayout.module.css";

const navItems = [
  { to: "/", label: "主页", end: true },
  { to: "/latest", label: "瞬间" },
  { to: "/blog", label: "写点" },
  { to: "/projects", label: "做点" },
  { to: "/contact", label: "找我鸭" },
];

export function MainLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [footerContactLinks, setFooterContactLinks] = useState<
    ContactLinkSummary[]
  >([]);

  // 默认使用暗色主题，更接近原始个人站的视觉方向。
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const savedTheme = localStorage.getItem("ziqi-theme");
    return savedTheme === "light" ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("ziqi-theme", theme);
  }, [theme]);

  useEffect(() => {
    let ignore = false;

    // footer 只取公开联系方式前四个图标，避免和“找我鸭”页面数据源分叉。
    siteClient
      .listContactLinks()
      .then((data) => {
        if (!ignore) {
          setFooterContactLinks(data.slice(0, 4));
        }
      })
      .catch(() => {
        if (!ignore) {
          // footer 图标加载失败时不打断页面主流程，直接保持为空即可。
          setFooterContactLinks([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className={`${styles.shell} ${isHomePage ? styles.shellHome : ""}`}>
      <header
        className={`${styles.header} ${isHomePage ? styles.headerOverlay : ""}`}
      >
        <div className={styles.navWrap}>
          <NavLink to="/" end className={styles.brand}>
            <span className={styles.brandText}>
              <strong>ZIQI</strong>HandSome
            </span>
          </NavLink>

          <nav className={styles.nav} aria-label="主导航">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.themeToggle}
              onClick={() =>
                setTheme((currentTheme) =>
                  currentTheme === "dark" ? "light" : "dark",
                )
              }
              aria-label={
                theme === "dark" ? "切换到亮色模式" : "切换到暗色模式"
              }
            >
              <span>{theme === "dark" ? "☾" : "☀"}</span>
              <span>{theme === "dark" ? "暗色" : "亮色"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className={`${styles.main} ${isHomePage ? styles.mainHome : ""}`}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <nav className={styles.footerNav} aria-label="底部导航">
            <NavLink to="/" className={styles.footerNavLink}>
              主页
            </NavLink>
            <NavLink to="/latest" className={styles.footerNavLink}>
              瞬间
            </NavLink>
            <NavLink to="/blog" className={styles.footerNavLink}>
              写点
            </NavLink>
            <NavLink to="/projects" className={styles.footerNavLink}>
              做点
            </NavLink>
            <NavLink to="/contact" className={styles.footerNavLink}>
              找我鸭
            </NavLink>
          </nav>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.footerMeta}>
            <p>Copyright © Ziqi Archive. All Rights Reserved.</p>
            <p>这是一个持续迭代中的个人网站项目，用来记录学习、生活与作品。</p>
            <p>
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noreferrer"
                className={styles.beianLink}
              >
                陇ICP备2024007543号
              </a>
            </p>
          </div>

          <div className={styles.socialLinks} aria-label="联系图标">
            {footerContactLinks.map((contactLink) => (
              <a
                key={contactLink.id}
                href={contactLink.profileUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.socialIconLink}
                aria-label={`访问 ${contactLink.platformName}`}
                title={contactLink.platformName}
              >
                <img
                  src={contactLink.iconUrl}
                  alt={contactLink.platformName}
                  className={styles.socialIcon}
                />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
