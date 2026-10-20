package com.fieldops.repository;

import com.fieldops.domain.entity.TemplateItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TemplateItemRepository extends JpaRepository<TemplateItem, UUID> {

    List<TemplateItem> findBySectionIdOrderByDisplayOrderAsc(UUID sectionId);
}
