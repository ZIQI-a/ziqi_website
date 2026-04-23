/**
 * 站点图片资源统一收口在这里维护。
 *
 * 约定：
 * - `content` 给 TS/JS 数据层直接引用
 * - `backgrounds` 会在应用启动时同步成全局 CSS 变量，给 CSS Modules 复用
 *
 * 后续如果你要替换 CDN、改图片文件名或压缩版本，优先只改这里。
 */
export const SITE_ASSETS = {
  backgrounds: {
    heroDark:
      'https://myphoto-1307175277.cos.ap-chengdu.myqcloud.com/mywebsite/image/th_1920x1080.webp',
    heroLight:
      'https://myphoto-1307175277.cos.ap-chengdu.myqcloud.com/mywebsite/image/banner-bg-light_1920x1080.webp',
    profilePanel:
      'https://myphoto-1307175277.cos.ap-chengdu.myqcloud.com/mywebsite/image/reason-bg.jpg',
  }
} as const

/**
 * 把背景图地址映射成全局 CSS 变量，避免 CSS Modules 里继续硬编码远程链接。
 */
export function syncGlobalAssetVariables(root: HTMLElement) {
  root.style.setProperty(
    '--asset-hero-dark-image',
    `url("${SITE_ASSETS.backgrounds.heroDark}")`,
  )
  root.style.setProperty(
    '--asset-hero-light-image',
    `url("${SITE_ASSETS.backgrounds.heroLight}")`,
  )
  root.style.setProperty(
    '--asset-profile-panel-image',
    `url("${SITE_ASSETS.backgrounds.profilePanel}")`,
  )
}
