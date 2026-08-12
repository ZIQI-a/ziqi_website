import { useState } from "react";
import type { CSSProperties } from "react";
import type { ProjectSummary } from "../types/content";
import styles from "./ProjectCard.module.css";

interface ProjectCardProps {
  project: ProjectSummary;
  variant: "vertical" | "horizontal";
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

export function ProjectCard({ project, variant }: ProjectCardProps) {
  const [showFallbackCover, setShowFallbackCover] = useState(!project.cover);
  const palette = createCoverPalette(project.name);
  const visibleStack = project.stack.slice(0, 3);
  const hiddenStackCount = Math.max(
    project.stack.length - visibleStack.length,
    0,
  );

  return (
    <article
      className={`${styles.card} ${
        variant === "horizontal" ? styles.horizontal : styles.vertical
      }`}
    >
      <div className={styles.coverFrame}>
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
            loading="lazy"
            decoding="async"
            onError={() => setShowFallbackCover(true)}
          />
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.status}>{project.status}</span>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
        </div>

        <div className={styles.footerRow}>
          <div className={styles.stack} aria-label="项目技术栈">
            {visibleStack.map((item) => (
              <span key={item}>{item}</span>
            ))}
            {hiddenStackCount > 0 ? <span>+{hiddenStackCount}</span> : null}
          </div>

          {project.link ? (
            <a
              className={styles.entryLink}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`查看项目：${project.name}`}
            >
              <span aria-hidden="true">→</span>
            </a>
          ) : (
            <button
              type="button"
              className={styles.entryDisabled}
              aria-label={`${project.name} 暂未开放`}
              title="项目暂未开放"
              disabled
            >
              <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
