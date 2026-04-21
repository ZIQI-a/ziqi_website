package com.ziqihome.backend.dto.project;

import java.util.List;

public record ProjectFormOptionsResponse(
    List<String> statusOptions,
    List<String> stackOptions
) {
}
