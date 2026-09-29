package com.fieldops.repository;

import com.fieldops.domain.entity.TemplateSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TemplateSectionRepository extends JpaRepository<TemplateSection, UUID> {

    List<TemplateSection> findByTemplateVersionIdOrderByDisplayOrderAsc(UUID templateVersionId);
}
