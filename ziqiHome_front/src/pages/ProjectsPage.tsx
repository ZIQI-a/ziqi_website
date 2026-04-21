import { useEffect, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { ProjectCard } from '../components/ProjectCard'
import { siteClient } from '../api/siteClient'
import type { ProjectSummary } from '../types/content'
import styles from './ProjectsPage.module.css'

export function ProjectsPage() {
  const [projectList, setProjectList] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void loadProjects()
  }, [])

  async function loadProjects() {
    setLoading(true)
    setError(null)

    try {
      const data = await siteClient.listProjects()
      setProjectList(data)
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : '项目内容加载失败，请稍后重试',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Selected Works"
        title="项目汇总"
        description="这里收集我已经完成、正在练习或准备继续推进的项目。第一版先做概要展示，让页面结构、数据接口和视觉层次先稳定下来。"
      />

      {loading ? (
        <section className={styles.statePanel}>
          <p>正在加载项目内容...</p>
        </section>
      ) : error ? (
        <section className={styles.statePanel}>
          <p>{error}</p>
        </section>
      ) : projectList.length === 0 ? (
        <section className={styles.statePanel}>
          <p>当前还没有已发布的项目内容。</p>
        </section>
      ) : (
        <section className={styles.list}>
          {projectList.map((project) => (
            <ProjectCard key={`${project.id}-${project.cover}`} project={project} />
          ))}
        </section>
      )}
    </div>
  )
}
