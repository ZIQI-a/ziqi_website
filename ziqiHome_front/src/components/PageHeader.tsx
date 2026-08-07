import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  align?: "center" | "start";
}

export function PageHeader({
  eyebrow,
  title,
  align = "center",
}: PageHeaderProps) {
  return (
    <header
      className={`${styles.header} ${
        align === "start" ? styles.headerStart : ""
      }`}
    >
      <span className={styles.eyebrow}>{eyebrow}</span>
      <h1 className={styles.title}>{title}</h1>
    </header>
  );
}
