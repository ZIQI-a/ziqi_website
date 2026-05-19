ALTER TABLE blog_posts
    ADD COLUMN source_repo VARCHAR(120) NULL AFTER source_url,
    ADD COLUMN source_doc_id VARCHAR(80) NULL AFTER source_repo,
    ADD COLUMN source_updated_at TIMESTAMP NULL AFTER source_doc_id,
    ADD COLUMN last_synced_at TIMESTAMP NULL AFTER source_updated_at;
