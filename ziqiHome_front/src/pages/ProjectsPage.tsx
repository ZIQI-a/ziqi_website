import { useEffect, useRef, useState } from "react";
import { ProjectCard } from "../components/ProjectCard";
import { siteClient } from "../api/siteClient";
import type { ProjectSummary } from "../types/content";
import styles from "./ProjectsPage.module.css";

const allStatusValue = "全部";

/**
 * 根据当前结果数量决定卡片形态，确保筛选后不会留下突兀的半行空位。
 */
function getProjectCardLayout(index: number, total: number) {
  const leadingVerticalCount = total >= 3 ? 3 : 0;
  const variant = index < leadingVerticalCount ? "vertical" : "horizontal";
  const horizontalCount = total - leadingVerticalCount;
  const isLastUnpairedHorizontal =
    variant === "horizontal" &&
    horizontalCount % 2 === 1 &&
    index === total - 1;

  return {
    variant,
    fullWidth: total === 1 || isLastUnpairedHorizontal,
  } as const;
}

export function ProjectsPage() {
  const [projectList, setProjectList] = useState<ProjectSummary[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([allStatusValue]);
  const [activeStatus, setActiveStatus] = useState(allStatusValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const projectCacheRef = useRef(new Map<string, ProjectSummary[]>());
  const projectRequestIdRef = useRef(0);

  useEffect(() => {
    void loadInitialProjectData();
  }, []);

  async function loadInitialProjectData() {
    setLoading(true);
    setError(null);

    try {
      const [projects, options] = await Promise.all([
        siteClient.listProjects(),
        siteClient.listProjectFilterOptions(),
      ]);
      projectCacheRef.current.set(allStatusValue, projects);
      setProjectList(projects);
      setStatusOptions([allStatusValue, ...options.statuses]);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "项目内容加载失败，请稍后重试",
      );
    } finally {
      setLoading(false);
    }
  }

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
      <header className={styles.pageHeader}>
        <div className={styles.headingGroup}>
          <span className={styles.eyebrow}>Project Index</span>
          <h1>项目工坊</h1>
        </div>

        {projectList.length > 0 ? (
          <div className={styles.statusFilters} aria-label="项目状态筛选">
            {statusOptions.map((status) => (
              <button
                key={status}
                type="button"
                className={`${styles.statusFilter} ${
                  activeStatus === status ? styles.statusFilterActive : ""
                }`}
                aria-pressed={activeStatus === status}
                onClick={() => handleStatusChange(status)}
              >
                {status}
              </button>
            ))}
          </div>
        ) : null}
      </header>

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
        <section key={activeStatus} className={styles.list}>
          {projectList.map((project, index) => {
            const layout = getProjectCardLayout(index, projectList.length);

            return (
              <div
                key={`${project.slug}-${project.cover}`}
                className={`${styles.projectItem} ${
                  layout.variant === "vertical"
                    ? styles.verticalItem
                    : styles.horizontalItem
                } ${layout.fullWidth ? styles.fullWidthItem : ""}`}
              >
                <ProjectCard project={project} variant={layout.variant} />
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
