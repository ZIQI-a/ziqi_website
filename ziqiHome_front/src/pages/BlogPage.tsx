import { useEffect, useMemo, useState } from "react";
import { BlogCard } from "../components/BlogCard";
import { PageHeader } from "../components/PageHeader";
import { siteClient } from "../api/siteClient";
import type { BlogPostSummary } from "../types/content";
import styles from "./BlogPage.module.css";

const ALL_CATEGORY = "全部";

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 筛选状态
  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [activeTag, setActiveTag] = useState<string | null>(null);

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

  useEffect(() => {
    void loadBlogs();
  }, []);

  // 从数据中提取分类和标签列表
  const categories = useMemo(
    () => [ALL_CATEGORY, ...Array.from(new Set(posts.map((p) => p.category))).sort()],
    [posts],
  );

  const allTags = useMemo(
    () => Array.from(new Set(posts.flatMap((p) => p.tags))).sort(),
    [posts],
  );

  // 多层筛选：搜索 + 分类 + 标签
  const filteredPosts = useMemo(() => {
    let result = posts;

    // 搜索过滤
    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(keyword) ||
          post.summary.toLowerCase().includes(keyword) ||
          post.tags.some((tag) => tag.toLowerCase().includes(keyword)),
      );
    }

    // 分类过滤
    if (activeCategory !== ALL_CATEGORY) {
      result = result.filter((post) => post.category === activeCategory);
    }

    // 标签过滤
    if (activeTag) {
      result = result.filter((post) => post.tags.includes(activeTag));
    }

    return result;
  }, [posts, searchText, activeCategory, activeTag]);

  function handleTagClick(tag: string) {
    setActiveTag((prev) => (prev === tag ? null : tag));
  }

  const hasActiveFilters =
    searchText.trim() !== "" || activeCategory !== ALL_CATEGORY || activeTag !== null;

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
        <>
          {/* 筛选栏 */}
          <section className={styles.filterBar}>
            {/* 搜索框 */}
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon} aria-hidden="true">
                ⌕
              </span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="搜索标题、摘要、标签..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {searchText ? (
                <button
                  type="button"
                  className={styles.searchClear}
                  onClick={() => setSearchText("")}
                  aria-label="清除搜索"
                >
                  ✕
                </button>
              ) : null}
            </div>

            {/* 分类筛选 */}
            <div className={styles.categoryRow}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`${styles.categoryChip} ${
                    activeCategory === cat ? styles.categoryChipActive : ""
                  }`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 标签筛选 */}
            {allTags.length > 0 ? (
              <div className={styles.tagRow}>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`${styles.tagChip} ${
                      activeTag === tag ? styles.tagChipActive : ""
                    }`}
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            ) : null}

            {/* 筛选结果提示 */}
            {hasActiveFilters ? (
              <p className={styles.filterHint}>
                {filteredPosts.length === 0
                  ? "没有匹配的文章，试试调整筛选条件"
                  : `找到 ${filteredPosts.length} 篇${activeCategory !== ALL_CATEGORY ? `「${activeCategory}」` : ""}文章`}
              </p>
            ) : null}
          </section>

          {/* 文章列表 */}
          {filteredPosts.length === 0 ? (
            <section className={styles.statePanel}>
              <p>当前筛选条件下没有找到匹配的文章。</p>
            </section>
          ) : (
            <section className={styles.grid} key={`${activeCategory}-${activeTag}`}>
              {filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} onTagClick={handleTagClick} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
