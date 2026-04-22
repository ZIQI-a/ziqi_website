package com.ziqihome.backend.controller;

import com.ziqihome.backend.dto.moment.MomentRequest;
import com.ziqihome.backend.dto.moment.MomentResponse;
import com.ziqihome.backend.service.MomentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/moments")
public class AdminMomentController {

  private final MomentService momentService;

  public AdminMomentController(MomentService momentService) {
    this.momentService = momentService;
  }

  @GetMapping
  public List<MomentResponse> listMoments() {
    return momentService.listAdminMoments();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public MomentResponse createMoment(@Valid @RequestBody MomentRequest request) {
    return momentService.createMoment(request);
  }

  @PutMapping("/{id}")
  public MomentResponse updateMoment(
      @PathVariable Long id,
      @Valid @RequestBody MomentRequest request
  ) {
    return momentService.updateMoment(id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteMoment(@PathVariable Long id) {
    momentService.deleteMoment(id);
  }
}
