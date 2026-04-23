import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { ProjectCard } from "../components/ProjectCard";
import { siteClient } from "../api/siteClient";
import type { ProjectSummary } from "../types/content";
import styles from "./ProjectsPage.module.css";

const allStatusValue = "全部";

export function ProjectsPage() {
  const [projectList, setProjectList] = useState<ProjectSummary[]>([]);
  const [activeStatus, setActiveStatus] = useState(allStatusValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    setError(null);

    try {
      const data = await siteClient.listProjects();
      setProjectList(data);
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

  const statusOptions = [
    allStatusValue,
    ...Array.from(new Set(projectList.map((project) => project.status))),
  ];
  const filteredProjects =
    activeStatus === allStatusValue
      ? projectList
      : projectList.filter((project) => project.status === activeStatus);

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
                onClick={() => setActiveStatus(status)}
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
          {filteredProjects.map((project) => (
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
