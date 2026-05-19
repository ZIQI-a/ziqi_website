ALTER TABLE blog_posts
  ADD COLUMN content_markdown MEDIUMTEXT NOT NULL AFTER cover,
  ADD COLUMN content_mode VARCHAR(20) NOT NULL DEFAULT 'LOCAL' AFTER content_markdown,
  ADD COLUMN source_type VARCHAR(20) NOT NULL DEFAULT 'ORIGINAL' AFTER content_mode,
  ADD COLUMN source_label VARCHAR(80) NULL AFTER source_type,
  ADD COLUMN source_url VARCHAR(255) NULL AFTER source_label;

UPDATE blog_posts
SET content_markdown = CONCAT('# ', title, '\n\n', summary, '\n');
