import type {
  BlogAdminItem,
  BlogAdminPayload,
  ProjectAdminItem,
  ProjectAdminPayload,
  ProjectFormOptions,
} from '../types/admin'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

interface ApiErrorShape {
  message?: string
  fieldErrors?: Record<string, string>
}

export class ApiError extends Error {
  fieldErrors?: Record<string, string>

  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.fieldErrors = fieldErrors
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiErrorShape
    throw new ApiError(errorBody.message ?? '请求失败，请稍后重试', errorBody.fieldErrors)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const adminClient = {
  listBlogs() {
    return request<BlogAdminItem[]>('/api/admin/blogs')
  },
  createBlog(payload: BlogAdminPayload) {
    return request<BlogAdminItem>('/api/admin/blogs', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateBlog(id: number, payload: BlogAdminPayload) {
    return request<BlogAdminItem>(`/api/admin/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  deleteBlog(id: number) {
    return request<void>(`/api/admin/blogs/${id}`, {
      method: 'DELETE',
    })
  },
  listProjects() {
    return request<ProjectAdminItem[]>('/api/admin/projects')
  },
  getProjectFormOptions() {
    return request<ProjectFormOptions>('/api/admin/projects/options')
  },
  createProject(payload: ProjectAdminPayload) {
    return request<ProjectAdminItem>('/api/admin/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateProject(id: number, payload: ProjectAdminPayload) {
    return request<ProjectAdminItem>(`/api/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  deleteProject(id: number) {
    return request<void>(`/api/admin/projects/${id}`, {
      method: 'DELETE',
    })
  },
}
