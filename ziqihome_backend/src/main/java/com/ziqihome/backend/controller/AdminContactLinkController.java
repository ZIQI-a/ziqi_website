package com.ziqihome.backend.controller;

import com.ziqihome.backend.dto.contact.ContactLinkRequest;
import com.ziqihome.backend.dto.contact.ContactLinkResponse;
import com.ziqihome.backend.service.ContactLinkService;
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
@RequestMapping("/api/admin/contact-links")
public class AdminContactLinkController {

  private final ContactLinkService contactLinkService;

  public AdminContactLinkController(ContactLinkService contactLinkService) {
    this.contactLinkService = contactLinkService;
  }

  @GetMapping
  public List<ContactLinkResponse> listContactLinks() {
    return contactLinkService.listAdminContactLinks();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ContactLinkResponse createContactLink(@Valid @RequestBody ContactLinkRequest request) {
    return contactLinkService.createContactLink(request);
  }

  @PutMapping("/{id}")
  public ContactLinkResponse updateContactLink(
      @PathVariable Long id,
      @Valid @RequestBody ContactLinkRequest request
  ) {
    return contactLinkService.updateContactLink(id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteContactLink(@PathVariable Long id) {
    contactLinkService.deleteContactLink(id);
  }
}
