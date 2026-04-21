import { useState } from "react";
import type { CSSProperties } from "react";
import type { ProjectSummary } from "../types/content";
import styles from "./ProjectCard.module.css";

interface ProjectCardProps {
  project: ProjectSummary;
}

function createCoverPalette(title: string) {
  const seed = Array.from(title).reduce(
    (total, char, index) => total + char.charCodeAt(0) * (index + 1),
    0,
  );

  // 默认封面只在站点主题附近波动，避免跑出偏蓝紫的冷色。
  const warmHue = 18 + (seed % 26);
  const accentHue = 36 + (seed % 22);

  return {
    primary: `hsla(${warmHue}, 64%, 36%, 0.96)`,
    secondary: `hsla(${accentHue}, 82%, 58%, 0.9)`,
    glow: `hsla(${44 + (seed % 12)}, 88%, 66%, 0.2)`,
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [showFallbackCover, setShowFallbackCover] = useState(!project.cover);
  const palette = createCoverPalette(project.name);

  return (
    <article className={styles.card}>
      {showFallbackCover ? (
        <div
          className={styles.coverFallback}
          aria-label={`${project.name} 默认封面`}
          style={
            {
              "--cover-primary": palette.primary,
              "--cover-secondary": palette.secondary,
              "--cover-glow": palette.glow,
            } as CSSProperties
          }
        >
          <strong className={styles.coverFallbackTitle}>{project.name}</strong>
        </div>
      ) : (
        <img
          className={styles.cover}
          src={project.cover}
          alt={project.name}
          onError={() => setShowFallbackCover(true)}
        />
      )}

      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.status}>{project.status}</span>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
        </div>

        <div className={styles.stack}>
          {project.stack.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>

        <ul className={styles.highlights}>
          {project.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>

        {project.link ? (
          <a
            className={styles.link}
            href={project.link}
            target="_blank"
            rel="noreferrer"
          >
            查看项目链接
          </a>
        ) : (
          <span className={styles.pending}>当前版本先展示概要信息</span>
        )}
      </div>
    </article>
  );
}
