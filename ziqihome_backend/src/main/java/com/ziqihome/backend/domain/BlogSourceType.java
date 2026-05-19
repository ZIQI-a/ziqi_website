package com.ziqihome.backend.domain;

/**
 * 统一标记文章来源，便于后续做语雀、CSDN 等平台导入和筛选。
 */
public enum BlogSourceType {
  ORIGINAL,
  YUQUE,
  CSDN,
  EXTERNAL
}
