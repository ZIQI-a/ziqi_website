package com.ziqihome.backend.service;

import com.ziqihome.backend.domain.ContactLink;
import com.ziqihome.backend.dto.contact.ContactLinkRequest;
import com.ziqihome.backend.dto.contact.ContactLinkResponse;
import com.ziqihome.backend.exception.ResourceNotFoundException;
import com.ziqihome.backend.mapper.ContactLinkMapper;
import com.ziqihome.backend.repository.ContactLinkRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ContactLinkService {

  private final ContactLinkRepository contactLinkRepository;
  private final ContactLinkMapper contactLinkMapper;

  public ContactLinkService(
      ContactLinkRepository contactLinkRepository,
      ContactLinkMapper contactLinkMapper
  ) {
    this.contactLinkRepository = contactLinkRepository;
    this.contactLinkMapper = contactLinkMapper;
  }

  @Transactional(readOnly = true)
  public List<ContactLinkResponse> listAdminContactLinks() {
    return contactLinkRepository.findAllByOrderBySortOrderAscIdDesc()
        .stream()
        .map(contactLinkMapper::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<ContactLinkResponse> listPublishedContactLinks() {
    return contactLinkRepository.findAllByPublishedTrueOrderBySortOrderAscIdDesc()
        .stream()
        .map(contactLinkMapper::toResponse)
        .toList();
  }

  public ContactLinkResponse createContactLink(ContactLinkRequest request) {
    ContactLink contactLink = new ContactLink();
    contactLinkMapper.updateEntity(contactLink, request);
    return contactLinkMapper.toResponse(contactLinkRepository.save(contactLink));
  }

  public ContactLinkResponse updateContactLink(Long id, ContactLinkRequest request) {
    ContactLink contactLink = getContactLinkOrThrow(id);
    contactLinkMapper.updateEntity(contactLink, request);
    return contactLinkMapper.toResponse(contactLinkRepository.save(contactLink));
  }

  public void deleteContactLink(Long id) {
    contactLinkRepository.delete(getContactLinkOrThrow(id));
  }

  private ContactLink getContactLinkOrThrow(Long id) {
    return contactLinkRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("联系方式不存在，id=" + id));
  }
}
