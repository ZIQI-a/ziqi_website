import type {
  BlogAdminItem,
  BlogAdminPayload,
  ContactLinkAdminItem,
  ContactLinkAdminPayload,
  MomentAdminItem,
  MomentAdminPayload,
  MomentCategoryAdminItem,
  MomentCategoryAdminPayload,
  ProjectAdminItem,
  ProjectAdminPayload,
  ProjectFormOptions,
  UserAdminItem,
  UserCreatePayload,
  UserPasswordPayload,
  UserUpdatePayload,
  YuqueSyncCommitPayload,
  YuqueSyncCommitResponse,
  YuqueSyncPreviewPayload,
  YuqueSyncPreviewResponse,
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
    credentials: 'include',
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

export const adminClient = {
  listContactLinks() {
    return request<ContactLinkAdminItem[]>('/api/admin/contact-links')
  },
  createContactLink(payload: ContactLinkAdminPayload) {
    return request<ContactLinkAdminItem>('/api/admin/contact-links', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateContactLink(id: number, payload: ContactLinkAdminPayload) {
    return request<ContactLinkAdminItem>(`/api/admin/contact-links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  deleteContactLink(id: number) {
    return request<void>(`/api/admin/contact-links/${id}`, {
      method: 'DELETE',
    })
  },
  listBlogs() {
    return request<BlogAdminItem[]>('/api/admin/blogs')
  },
  getBlog(id: number) {
    return request<BlogAdminItem>(`/api/admin/blogs/${id}`)
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
  previewYuqueSync(payload: YuqueSyncPreviewPayload) {
    return request<YuqueSyncPreviewResponse>('/api/admin/blogs/yuque/preview', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  syncYuqueBlogs(payload: YuqueSyncCommitPayload) {
    return request<YuqueSyncCommitResponse>('/api/admin/blogs/yuque/sync', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  listMoments(options?: { categoryId?: number; published?: boolean }) {
    return request<MomentAdminItem[]>(
      `/api/admin/moments${buildQuery({
        categoryId: options?.categoryId,
        published: options?.published,
      })}`,
    )
  },
  createMoment(payload: MomentAdminPayload) {
    return request<MomentAdminItem>('/api/admin/moments', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateMoment(id: number, payload: MomentAdminPayload) {
    return request<MomentAdminItem>(`/api/admin/moments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  deleteMoment(id: number) {
    return request<void>(`/api/admin/moments/${id}`, {
      method: 'DELETE',
    })
  },
  listMomentCategories() {
    return request<MomentCategoryAdminItem[]>('/api/admin/moments/categories')
  },
  createMomentCategory(payload: MomentCategoryAdminPayload) {
    return request<MomentCategoryAdminItem>('/api/admin/moments/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateMomentCategory(id: number, payload: MomentCategoryAdminPayload) {
    return request<MomentCategoryAdminItem>(`/api/admin/moments/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  deleteMomentCategory(id: number) {
    return request<void>(`/api/admin/moments/categories/${id}`, {
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
  listUsers() {
    return request<UserAdminItem[]>('/api/admin/users')
  },
  createUser(payload: UserCreatePayload) {
    return request<UserAdminItem>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateUser(id: number, payload: UserUpdatePayload) {
    return request<UserAdminItem>(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  updateUserPassword(id: number, payload: UserPasswordPayload) {
    return request<void>(`/api/admin/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  deleteUser(id: number) {
    return request<void>(`/api/admin/users/${id}`, {
      method: 'DELETE',
    })
  },
}
