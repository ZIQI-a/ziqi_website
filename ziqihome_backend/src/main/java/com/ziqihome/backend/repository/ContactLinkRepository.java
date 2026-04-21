package com.ziqihome.backend.repository;

import com.ziqihome.backend.domain.ContactLink;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactLinkRepository extends JpaRepository<ContactLink, Long> {

  List<ContactLink> findAllByOrderBySortOrderAscIdDesc();

  List<ContactLink> findAllByPublishedTrueOrderBySortOrderAscIdDesc();
}
