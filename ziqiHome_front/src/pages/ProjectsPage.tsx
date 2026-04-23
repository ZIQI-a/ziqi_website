import { useEffect, useRef, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { ProjectCard } from "../components/ProjectCard";
import { siteClient } from "../api/siteClient";
import type { ProjectSummary } from "../types/content";
import styles from "./ProjectsPage.module.css";

const allStatusValue = "全部";

export function ProjectsPage() {
  const [projectList, setProjectList] = useState<ProjectSummary[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([allStatusValue]);
  const [activeStatus, setActiveStatus] = useState(allStatusValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const projectCacheRef = useRef(new Map<string, ProjectSummary[]>());
  const projectRequestIdRef = useRef(0);

  useEffect(() => {
    void loadProjects();
  }, []);

  async function loadProjects(status = allStatusValue) {
    const requestId = projectRequestIdRef.current + 1;
    const cachedProjects = projectCacheRef.current.get(status);
    projectRequestIdRef.current = requestId;

    if (cachedProjects) {
      // 同一筛选条件命中缓存时直接复用，避免重复请求和 loading 面板造成页面跳动。
      setProjectList(cachedProjects);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(projectCacheRef.current.size === 0);
    setError(null);

    try {
      const data = await siteClient.listProjects(
        status === allStatusValue ? undefined : { status },
      );

      if (requestId !== projectRequestIdRef.current) {
        return;
      }

      projectCacheRef.current.set(status, data);
      setProjectList(data);

      if (status === allStatusValue) {
        // 状态筛选项来自后端返回的公开项目集合，后续点击筛选时只传状态参数请求。
        setStatusOptions([
          allStatusValue,
          ...Array.from(new Set(data.map((project) => project.status))),
        ]);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "项目内容加载失败，请稍后重试",
      );
    } finally {
      if (requestId === projectRequestIdRef.current) {
        setLoading(false);
      }
    }
  }

  function handleStatusChange(status: string) {
    if (status === activeStatus) {
      return;
    }

    setActiveStatus(status);
    void loadProjects(status);
  }

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Projects Works"
        title="项目工坊"
        description="每一次想法，每一次迭代，都是构建未来的脚印"
      />

      {projectList.length > 0 ? (
        <section className={styles.toolbar} aria-label="项目状态筛选">
          <div className={styles.statusFilters}>
            {statusOptions.map((status) => (
              <button
                key={status}
                type="button"
                className={`${styles.statusFilter} ${
                  activeStatus === status ? styles.statusFilterActive : ""
                }`}
                onClick={() => handleStatusChange(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </section>
      ) : null}

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
            <ProjectCard
              key={`${project.id}-${project.cover}`}
              project={project}
            />
          ))}
        </section>
      )}
    </div>
  );
}
