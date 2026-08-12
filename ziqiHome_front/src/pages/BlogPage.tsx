import { useEffect, useRef, useState } from "react";
import { BlogCard } from "../components/BlogCard";
import { PageHeader } from "../components/PageHeader";
import { siteClient } from "../api/siteClient";
import type {
  BlogFilterOptions,
  BlogPostSummary,
} from "../types/content";
import styles from "./BlogPage.module.css";

const ALL_CATEGORY = "全部";
const EMPTY_FILTER_OPTIONS: BlogFilterOptions = { categories: [], tags: [] };

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [filterOptions, setFilterOptions] =
    useState<BlogFilterOptions>(EMPTY_FILTER_OPTIONS);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const requestIdRef = useRef(0);
  const skipFirstFilterRequestRef = useRef(true);
  const filterMenuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    let cancelled = false;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    async function loadInitialContent() {
      setInitialLoading(true);
      setError(null);

      try {
        // 文章与稳定筛选项并行加载，避免前端再从结果集推导分类和标签。
        const [blogPosts, options] = await Promise.all([
          siteClient.listBlogs(),
          siteClient.listBlogFilterOptions(),
        ]);

        if (cancelled || requestId !== requestIdRef.current) {
          return;
        }

        setPosts(blogPosts);
        setFilterOptions(options);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "博客内容加载失败，请稍后重试",
          );
        }
      } finally {
        if (!cancelled && requestId === requestIdRef.current) {
          setInitialLoading(false);
        }
      }
    }

    void loadInitialContent();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(searchText.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    if (skipFirstFilterRequestRef.current) {
      skipFirstFilterRequestRef.current = false;
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setRefreshing(true);
    setError(null);

    async function loadFilteredBlogs() {
      try {
        const data = await siteClient.listBlogs({
          keyword: debouncedKeyword || undefined,
          category:
            activeCategory === ALL_CATEGORY ? undefined : activeCategory,
          tags: activeTags.length > 0 ? activeTags : undefined,
        });

        // 快速输入或连续切换筛选时，只接受最后一次请求的响应。
        if (requestId === requestIdRef.current) {
          setPosts(data);
        }
      } catch (loadError) {
        if (requestId === requestIdRef.current) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "博客内容加载失败，请稍后重试",
          );
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setRefreshing(false);
        }
      }
    }

    void loadFilteredBlogs();
  }, [activeCategory, activeTags, debouncedKeyword]);

  useEffect(() => {
    function closeFilterMenu(event: PointerEvent) {
      if (
        filterMenuRef.current?.open &&
        !filterMenuRef.current.contains(event.target as Node)
      ) {
        filterMenuRef.current.open = false;
      }
    }

    document.addEventListener("pointerdown", closeFilterMenu);
    return () => document.removeEventListener("pointerdown", closeFilterMenu);
  }, []);

  function handleTagToggle(tag: string) {
    setActiveTags((currentTags) =>
      currentTags.includes(tag)
        ? currentTags.filter((activeTag) => activeTag !== tag)
        : [...currentTags, tag],
    );
  }

  function handleSearchClear() {
    setSearchText("");
    setDebouncedKeyword("");
  }

  function clearAllFilters() {
    handleSearchClear();
    setActiveCategory(ALL_CATEGORY);
    setActiveTags([]);
  }

  const hasActiveFilters =
    searchText.trim() !== "" ||
    activeCategory !== ALL_CATEGORY ||
    activeTags.length > 0;
  const categories = [ALL_CATEGORY, ...filterOptions.categories];
  const leadPosts = posts.slice(0, 3);
  const standardPosts = posts.slice(3);
  const coverUsage = posts.reduce<Map<string, number>>((usage, post) => {
    const normalizedCover = post.cover.trim();
    if (normalizedCover) {
      usage.set(normalizedCover, (usage.get(normalizedCover) ?? 0) + 1);
    }
    return usage;
  }, new Map());

  function hasRepeatedCover(post: BlogPostSummary) {
    return (coverUsage.get(post.cover.trim()) ?? 0) > 1;
  }

  return (
    <div className={styles.page}>
      <section className={styles.titleRow} aria-label="博客标题与搜索">
        <PageHeader eyebrow="Blog Archive" title="博客笔记" align="start" />

        <div className={styles.searchWrap}>
          <svg
            className={styles.searchIcon}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="搜索文章、标签或关键词"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            aria-label="搜索博客"
          />
          {searchText ? (
            <button
              type="button"
              className={styles.searchClear}
              onClick={handleSearchClear}
              aria-label="清除搜索"
            >
              ✕
            </button>
          ) : null}
        </div>
      </section>

      {!initialLoading ? (
        <section className={styles.toolbar} aria-label="博客筛选">
          <div className={styles.categoryTabs} role="tablist">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={activeCategory === category}
                className={`${styles.categoryTab} ${
                  activeCategory === category ? styles.categoryTabActive : ""
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {filterOptions.tags.length > 0 ? (
            <details
              ref={filterMenuRef}
              className={styles.filterMenu}
              onKeyDown={(event) => {
                if (event.key === "Escape" && filterMenuRef.current) {
                  filterMenuRef.current.open = false;
                }
              }}
            >
              <summary className={styles.filterSummary}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 6h16M7 12h10M10 18h4" />
                </svg>
                <span>筛选</span>
                {activeTags.length > 0 ? (
                  <span className={styles.filterCount}>{activeTags.length}</span>
                ) : null}
              </summary>

              <div className={styles.filterPopover}>
                <div className={styles.filterPopoverHeader}>
                  <strong>按标签筛选</strong>
                  {activeTags.length > 0 ? (
                    <button type="button" onClick={() => setActiveTags([])}>
                      清空
                    </button>
                  ) : null}
                </div>
                <div className={styles.tagOptions}>
                  {filterOptions.tags.map((tag) => (
                    <label
                      key={tag}
                      className={`${styles.tagOption} ${
                        activeTags.includes(tag) ? styles.tagOptionActive : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={activeTags.includes(tag)}
                        onChange={() => handleTagToggle(tag)}
                      />
                      <span>{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            </details>
          ) : null}
        </section>
      ) : null}

      <div className={styles.requestStatus} aria-live="polite">
        {refreshing ? "正在更新文章…" : error && posts.length > 0 ? error : ""}
      </div>

      {initialLoading ? (
        <section className={styles.statePanel}>
          <p>正在加载博客内容...</p>
        </section>
      ) : error && posts.length === 0 ? (
        <section className={styles.statePanel}>
          <p>{error}</p>
        </section>
      ) : posts.length === 0 ? (
        <section className={styles.statePanel}>
          <p>
            {hasActiveFilters
              ? "当前筛选条件下没有找到匹配的文章。"
              : "当前还没有已发布的博客内容。"}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              className={styles.resetButton}
              onClick={clearAllFilters}
            >
              清除全部筛选
            </button>
          ) : null}
        </section>
      ) : (
        <section
          className={`${styles.articleGrid} ${
            refreshing ? styles.articleGridRefreshing : ""
          }`}
          aria-busy={refreshing}
        >
          {/* 前三篇保留重点稿 + 两篇紧凑稿的非对称编辑式布局。 */}
          <div className={styles.leadGrid}>
            {leadPosts.map((post, index) => (
              <BlogCard
                key={post.id}
                post={post}
                variant={index === 0 ? "featured" : "compact"}
                onTagClick={handleTagToggle}
                repeatedCover={hasRepeatedCover(post)}
              />
            ))}
          </div>

          {/* 后续标准卡片使用独立等宽网格，不继承重点区的列宽比例。 */}
          {standardPosts.length > 0 ? (
            <div className={styles.standardGrid}>
              {standardPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  variant="standard"
                  onTagClick={handleTagToggle}
                  repeatedCover={hasRepeatedCover(post)}
                />
              ))}
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
