import { useEffect, useState } from "react";
import { BlogCard } from "../components/BlogCard";
import { PageHeader } from "../components/PageHeader";
import { siteClient } from "../api/siteClient";
import type { BlogPostSummary } from "../types/content";
import styles from "./BlogPage.module.css";

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadBlogs();
  }, []);

  async function loadBlogs() {
    setLoading(true);
    setError(null);

    try {
      const data = await siteClient.listBlogs();
      setPosts(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "博客内容加载失败，请稍后重试",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Blog Archive"
        title="博客笔记"
        description="一些感想"
      />

      {loading ? (
        <section className={styles.statePanel}>
          <p>正在加载博客内容...</p>
        </section>
      ) : error ? (
        <section className={styles.statePanel}>
          <p>{error}</p>
        </section>
      ) : posts.length === 0 ? (
        <section className={styles.statePanel}>
          <p>当前还没有已发布的博客内容。</p>
        </section>
      ) : (
        <section className={styles.grid}>
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </section>
      )}
    </div>
  );
}
