package com.fieldops.repository;

import com.fieldops.domain.entity.InspectionTemplateVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InspectionTemplateVersionRepository extends JpaRepository<InspectionTemplateVersion, UUID> {

    List<InspectionTemplateVersion> findByTemplateIdOrderByVersionNumberDesc(UUID templateId);

    Optional<InspectionTemplateVersion> findByTemplateIdAndVersionNumber(UUID templateId, Integer versionNumber);

    @Query("SELECT v FROM InspectionTemplateVersion v LEFT JOIN FETCH v.sections s LEFT JOIN FETCH s.items WHERE v.id = :id")
    Optional<InspectionTemplateVersion> findByIdWithSectionsAndItems(@Param("id") UUID id);

    Optional<InspectionTemplateVersion> findFirstByTemplateIdAndActiveForNewInspectionsTrueOrderByVersionNumberDesc(UUID templateId);
}
