CREATE TABLE blog_posts (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(150) NOT NULL,
  publish_date DATE NOT NULL,
  category VARCHAR(80) NOT NULL,
  summary VARCHAR(600) NOT NULL,
  cover VARCHAR(255) NOT NULL,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blog_tags (
  blog_post_id BIGINT NOT NULL,
  tag_order INT NOT NULL,
  tag VARCHAR(60) NOT NULL,
  PRIMARY KEY (blog_post_id, tag_order),
  CONSTRAINT fk_blog_tags_blog_post
    FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id)
    ON DELETE CASCADE
);

CREATE TABLE projects (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(600) NOT NULL,
  status VARCHAR(20) NOT NULL,
  cover VARCHAR(255) NOT NULL,
  link VARCHAR(255),
  published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_stacks (
  project_id BIGINT NOT NULL,
  stack_order INT NOT NULL,
  stack_item VARCHAR(60) NOT NULL,
  PRIMARY KEY (project_id, stack_order),
  CONSTRAINT fk_project_stacks_project
    FOREIGN KEY (project_id) REFERENCES projects(id)
    ON DELETE CASCADE
);

CREATE TABLE project_highlights (
  project_id BIGINT NOT NULL,
  highlight_order INT NOT NULL,
  highlight VARCHAR(120) NOT NULL,
  PRIMARY KEY (project_id, highlight_order),
  CONSTRAINT fk_project_highlights_project
    FOREIGN KEY (project_id) REFERENCES projects(id)
    ON DELETE CASCADE
);
