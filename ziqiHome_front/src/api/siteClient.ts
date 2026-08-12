import type {
  BlogFilterOptions,
  BlogPostDetail,
  BlogPostSummary,
  ContactLinkSummary,
  MomentCategorySummary,
  MomentSummary,
  ProjectFilterOptions,
  ProjectSummary,
} from '../types/content'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

interface SiteBlogResponse {
  id: number
  slug: string
  title: string
  publishDate: string
  category: string
  summary: string
  cover: string
  tags: string[]
  contentMode: BlogPostSummary['contentMode']
  sourceType: string
  sourceLabel: string | null
  sourceUrl: string | null
}

interface SiteBlogDetailResponse extends SiteBlogResponse {
  contentMarkdown: string
}

interface SiteProjectResponse {
  slug: string
  name: string
  description: string
  status: ProjectSummary['status']
  cover: string
  link: string | null
  stack: string[]
}

interface SiteContactLinkResponse {
  id: number
  platformName: string
  profileUrl: string
  iconUrl: string
  description: string
  published: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface SiteMomentCategoryResponse {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

interface SiteMomentResponse {
  id: number
  content: string
  imageUrl: string | null
  imageAlt: string | null
  category: {
    id: number
    name: string
  }
  published: boolean
  showOnHome: boolean
  pinned: boolean
  createdAt: string
  updatedAt: string
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`)

  if (!response.ok) {
    throw new Error('请求站点内容失败，请稍后重试')
  }

  return (await response.json()) as T
}

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      query.set(key, String(value))
    }
  })

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

/**
 * 博客标签使用重复查询参数传递，让后端按多标签交集执行筛选。
 */
function buildBlogQuery(options?: {
  keyword?: string
  category?: string
  tags?: string[]
}) {
  const query = new URLSearchParams()

  if (options?.keyword) {
    query.set('keyword', options.keyword)
  }
  if (options?.category) {
    query.set('category', options.category)
  }
  options?.tags?.forEach((tag) => query.append('tags', tag))

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

function mapBlogSummary(blog: SiteBlogResponse): BlogPostSummary {
  return {
    id: blog.slug || String(blog.id),
    slug: blog.slug,
    title: blog.title,
    date: blog.publishDate,
    category: blog.category,
    summary: blog.summary,
    tags: blog.tags,
    cover: blog.cover,
    contentMode: blog.contentMode,
    sourceType: blog.sourceType,
    sourceLabel: blog.sourceLabel ?? undefined,
    sourceUrl: blog.sourceUrl ?? undefined,
  }
}

function mapBlogDetail(blog: SiteBlogDetailResponse): BlogPostDetail {
  return {
    id: blog.slug || String(blog.id),
    slug: blog.slug,
    title: blog.title,
    date: blog.publishDate,
    category: blog.category,
    summary: blog.summary,
    tags: blog.tags,
    cover: blog.cover,
    contentMarkdown: blog.contentMarkdown,
    contentMode: blog.contentMode,
    sourceType: blog.sourceType,
    sourceLabel: blog.sourceLabel ?? undefined,
    sourceUrl: blog.sourceUrl ?? undefined,
  }
}

function mapProjectSummary(project: SiteProjectResponse): ProjectSummary {
  return {
    slug: project.slug,
    name: project.name,
    description: project.description,
    stack: project.stack,
    status: project.status,
    cover: project.cover,
    link: project.link ?? undefined,
  }
}

function mapContactLinkSummary(contactLink: SiteContactLinkResponse): ContactLinkSummary {
  return {
    id: String(contactLink.id),
    platformName: contactLink.platformName,
    profileUrl: contactLink.profileUrl,
    iconUrl: contactLink.iconUrl,
    description: contactLink.description,
  }
}

function mapMomentSummary(moment: SiteMomentResponse): MomentSummary {
  return {
    id: String(moment.id),
    content: moment.content,
    imageUrl: moment.imageUrl ?? undefined,
    imageAlt: moment.imageAlt ?? undefined,
    categoryId: String(moment.category.id),
    categoryName: moment.category.name,
    published: moment.published,
    showOnHome: moment.showOnHome,
    pinned: moment.pinned,
    createdAt: moment.createdAt,
    updatedAt: moment.updatedAt,
  }
}

function mapMomentCategorySummary(
  category: SiteMomentCategoryResponse,
): MomentCategorySummary {
  return {
    id: String(category.id),
    name: category.name,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }
}

/**
 * 公开站点只消费后端已经筛过 published 的接口，避免前台再接触管理端数据形态。
 */
export const siteClient = {
  async listBlogs(options?: {
    keyword?: string
    category?: string
    tags?: string[]
  }) {
    const data = await request<SiteBlogResponse[]>(
      `/api/site/blogs${buildBlogQuery(options)}`,
    )
    return data.map(mapBlogSummary)
  },
  async listBlogFilterOptions() {
    return request<BlogFilterOptions>('/api/site/blogs/filter-options')
  },
  async getBlog(slug: string) {
    const data = await request<SiteBlogDetailResponse>(`/api/site/blogs/${slug}`)
    return mapBlogDetail(data)
  },
  async listProjects(options?: { status?: string }) {
    const data = await request<SiteProjectResponse[]>(
      `/api/site/projects${buildQuery({ status: options?.status })}`,
    )
    return data.map(mapProjectSummary)
  },
  async listProjectFilterOptions() {
    return request<ProjectFilterOptions>('/api/site/projects/filter-options')
  },
  async listContactLinks() {
    const data = await request<SiteContactLinkResponse[]>('/api/site/contact-links')
    return data.map(mapContactLinkSummary)
  },
  async listMoments(options?: {
    categoryId?: string | number
    showOnHome?: boolean
    hasImage?: boolean
  }) {
    const data = await request<SiteMomentResponse[]>(
      `/api/site/moments${buildQuery({
        categoryId: options?.categoryId,
        showOnHome: options?.showOnHome,
        hasImage: options?.hasImage,
      })}`,
    )
    return data.map(mapMomentSummary)
  },
  async listMomentCategories() {
    const data = await request<SiteMomentCategoryResponse[]>('/api/site/moments/categories')
    return data.map(mapMomentCategorySummary)
  },
}
