import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import styles from './MainLayout.module.css'

const navItems = [
  { to: '/', label: '主页', end: true },
  { to: '/latest', label: '最新' },
  { to: '/blog', label: '写点' },
  { to: '/projects', label: '做点' },
  { to: '/contact', label: '找我鸭' },
]

export function MainLayout() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  // 默认使用暗色主题，更接近原始个人站的视觉方向。
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('ziqi-theme')
    return savedTheme === 'light' ? 'light' : 'dark'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('ziqi-theme', theme)
  }, [theme])

  return (
    <div className={`${styles.shell} ${isHomePage ? styles.shellHome : ''}`}>
      <header
        className={`${styles.header} ${isHomePage ? styles.headerOverlay : ''}`}
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
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
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
                  currentTheme === 'dark' ? 'light' : 'dark',
                )
              }
              aria-label={
                theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'
              }
            >
              <span>{theme === 'dark' ? '☾' : '☀'}</span>
              <span>{theme === 'dark' ? '暗色' : '亮色'}</span>
            </button>

            <NavLink to="/contact" className={styles.contact}>
              联系我
            </NavLink>
          </div>
        </div>
      </header>

      <main className={`${styles.main} ${isHomePage ? styles.mainHome : ''}`}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <nav className={styles.footerNav} aria-label="底部导航">
            <NavLink to="/" className={styles.footerNavLink}>
              主页
            </NavLink>
            <NavLink to="/latest" className={styles.footerNavLink}>
              最新
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

          <a className={styles.followButton} href="mailto:ziqi@example.com">
            关注我
          </a>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.footerMeta}>
            <p>Copyright © Ziqi Archive. All Rights Reserved.</p>
            <p>这是一个持续迭代中的个人网站项目，用来记录学习、生活与作品。</p>
          </div>

          <div className={styles.socialLinks} aria-label="社交链接">
            <a href="mailto:ziqi@example.com">Email</a>
            <a href="/blog">Blog</a>
            <a href="/projects">Works</a>
            <a href="/">Home</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
