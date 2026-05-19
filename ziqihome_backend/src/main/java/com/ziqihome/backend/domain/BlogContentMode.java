package com.ziqihome.backend.domain;

/**
 * 博客内容模式：
 * LOCAL 只在本站展示正文，
 * EXTERNAL 只跳原文链接，
 * HYBRID 同时保留本站正文与原文出处。
 */
public enum BlogContentMode {
  LOCAL,
  EXTERNAL,
  HYBRID
}
