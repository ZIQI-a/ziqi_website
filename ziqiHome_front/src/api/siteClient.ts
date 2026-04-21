import type { BlogPostSummary, ProjectSummary } from '../types/content'

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

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`)

  if (!response.ok) {
    throw new Error('请求站点内容失败，请稍后重试')
  }

  return (await response.json()) as T
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

/**
 * 公开站点只消费后端已经筛过 published 的接口，避免前台再接触管理端数据形态。
 */
export const siteClient = {
  async listBlogs() {
    const data = await request<SiteBlogResponse[]>('/api/site/blogs')
    return data.map(mapBlogSummary)
  },
  async listProjects() {
    const data = await request<SiteProjectResponse[]>('/api/site/projects')
    return data.map(mapProjectSummary)
  },
}
