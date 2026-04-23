import type {
  BlogPostSummary,
  ContactLinkSummary,
  MomentCategorySummary,
  MomentSummary,
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
  published: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface SiteProjectResponse {
  id: number
  slug: string
  name: string
  description: string
  status: ProjectSummary['status']
  cover: string
  link: string | null
  stack: string[]
  highlights: string[]
  published: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
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

function mapBlogSummary(blog: SiteBlogResponse): BlogPostSummary {
  return {
    id: blog.slug || String(blog.id),
    title: blog.title,
    date: blog.publishDate,
    category: blog.category,
    summary: blog.summary,
    tags: blog.tags,
    cover: blog.cover,
  }
}

function mapProjectSummary(project: SiteProjectResponse): ProjectSummary {
  return {
    id: project.slug || String(project.id),
    name: project.name,
    description: project.description,
    stack: project.stack,
    status: project.status,
    highlights: project.highlights,
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
  async listBlogs() {
    const data = await request<SiteBlogResponse[]>('/api/site/blogs')
    return data.map(mapBlogSummary)
  },
  async listProjects(options?: { status?: string }) {
    const data = await request<SiteProjectResponse[]>(
      `/api/site/projects${buildQuery({ status: options?.status })}`,
    )
    return data.map(mapProjectSummary)
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
