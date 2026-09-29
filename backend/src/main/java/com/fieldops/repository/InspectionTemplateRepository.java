package com.fieldops.repository;

import com.fieldops.domain.entity.InspectionTemplate;
import com.fieldops.domain.enums.TemplateStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InspectionTemplateRepository extends JpaRepository<InspectionTemplate, UUID> {

    List<InspectionTemplate> findAllByOrderByCreatedAtDesc();

    List<InspectionTemplate> findByStatus(TemplateStatus status);
}
