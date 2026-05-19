package com.ziqihome.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.ziqihome.backend.exception.BadRequestException;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriUtils;
import org.springframework.util.StreamUtils;
import org.springframework.web.client.RestClient;

@Component
public class YuqueClient {

  private static final String YUQUE_API_BASE_URL = "https://www.yuque.com/api/v2";

  private final RestClient restClient;
  private final ObjectMapper objectMapper;
  private final ObjectMapper yamlMapper;

  public YuqueClient(ObjectMapper objectMapper) {
    this.restClient = RestClient.builder().build();
    this.objectMapper = objectMapper;
    this.yamlMapper = new ObjectMapper(new YAMLFactory());
  }

  /**
   * 第一版同步只读取指定知识库下的文档清单，避免把 token 落库，也避免一次性引入更重的 SDK 依赖。
   */
  public List<YuqueDocumentSummary> listDocuments(String token, String repoNamespace) {
    JsonNode dataNode = readJson(buildUri("/repos/%s/docs".formatted(encodePath(repoNamespace))), token).path("data");
    JsonNode tocRoot = parseTocYaml(dataNode.path("toc_yml").asText(null));
    long repoId = dataNode.path("id").asLong();
    List<YuqueDocumentSummary> documents = new ArrayList<>();
    for (JsonNode item : tocRoot) {
      if (!"DOC".equals(item.path("type").asText())) {
        continue;
      }

      documents.add(new YuqueDocumentSummary(
          String.valueOf(repoId),
          textValue(item, "doc_id"),
          textValue(item, "url"),
          textValue(item, "title"),
          null,
          buildDocumentUrl(repoNamespace, textValue(item, "url")),
          null,
          null
      ));
    }

    return documents;
  }

  public YuqueDocumentDetail getDocument(String token, String repoId, String docId) {
    String path = "/repos/%s/docs/%s?raw=1".formatted(
        encodePath(repoId),
        encodePath(docId)
    );
    JsonNode dataNode = readJson(buildUri(path), token).path("data");

    if (dataNode.isMissingNode() || dataNode.isNull()) {
      throw new BadRequestException("语雀返回的文档详情为空");
    }

    return new YuqueDocumentDetail(
        repoId,
        textValue(dataNode, "id"),
        textValue(dataNode, "slug"),
        textValue(dataNode, "title"),
        firstNonBlank(textValue(dataNode, "body"), textValue(dataNode, "body_draft")),
        firstNonBlank(textValue(dataNode, "description"), textValue(dataNode, "custom_description")),
        textValue(dataNode, "url"),
        parseInstant(dataNode.path("updated_at").asText(null)),
        parseInstant(dataNode.path("first_published_at").asText(null))
    );
  }

  private JsonNode readJson(URI uri, String token) {
    String body = restClient.get()
        .uri(uri)
        .header("X-Auth-Token", token.trim())
        .retrieve()
        .onStatus(HttpStatusCode::isError, (request, response) -> {
          String responseBody = StreamUtils.copyToString(response.getBody(), StandardCharsets.UTF_8);
          throw new BadRequestException(extractErrorMessage(responseBody, response.getStatusCode().value()));
        })
        .body(String.class);

    try {
      return objectMapper.readTree(body);
    } catch (IOException exception) {
      throw new BadRequestException("语雀返回内容解析失败");
    }
  }

  private String extractErrorMessage(String responseBody, int statusCode) {
    try {
      JsonNode root = objectMapper.readTree(responseBody);
      String message = firstNonBlank(root.path("message").asText(null), root.path("error").asText(null));
      if (message != null) {
        return "语雀请求失败（%s）：%s".formatted(statusCode, message);
      }
    } catch (IOException ignored) {
      // 保留兜底消息，避免第三方异常结构影响主流程。
    }

    return "语雀请求失败（%s）".formatted(statusCode);
  }

  private URI buildUri(String path) {
    return URI.create(YUQUE_API_BASE_URL + path);
  }

  private JsonNode parseTocYaml(String tocYaml) {
    if (tocYaml == null || tocYaml.isBlank()) {
      throw new BadRequestException("语雀知识库目录为空，无法同步");
    }

    try {
      JsonNode root = yamlMapper.readTree(tocYaml);
      if (root == null || !root.isArray()) {
        throw new BadRequestException("语雀目录结构解析失败");
      }
      return root;
    } catch (IOException exception) {
      throw new BadRequestException("语雀目录结构解析失败");
    }
  }

  private String encodePath(String value) {
    return UriUtils.encodePathSegment(value, java.nio.charset.StandardCharsets.UTF_8);
  }

  private String textValue(JsonNode node, String fieldName) {
    JsonNode valueNode = node.path(fieldName);
    if (valueNode.isMissingNode() || valueNode.isNull()) {
      return null;
    }
    return valueNode.asText();
  }

  private Instant parseInstant(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }

    try {
      return Instant.parse(value);
    } catch (Exception ignored) {
      return null;
    }
  }

  private String firstNonBlank(String... values) {
    for (String value : values) {
      if (value != null && !value.isBlank()) {
        return value;
      }
    }
    return null;
  }

  public record YuqueDocumentSummary(
      String repoId,
      String id,
      String slug,
      String title,
      String description,
      String url,
      Instant updatedAt,
      Instant publishedAt
  ) {
  }

  public record YuqueDocumentDetail(
      String repoId,
      String id,
      String slug,
      String title,
      String body,
      String description,
      String url,
      Instant updatedAt,
      Instant publishedAt
  ) {
  }

  private String buildDocumentUrl(String repoNamespace, String slug) {
    if (repoNamespace == null || repoNamespace.isBlank() || slug == null || slug.isBlank()) {
      return null;
    }

    return "https://www.yuque.com/%s/%s".formatted(repoNamespace, slug);
  }
}
