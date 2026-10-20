package com.fieldops.repository;

import com.fieldops.domain.entity.Evidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EvidenceRepository extends JpaRepository<Evidence, UUID> {

    List<Evidence> findByInspectionId(UUID inspectionId);

    List<Evidence> findByResponseId(UUID responseId);

    List<Evidence> findByNonConformityId(UUID nonConformityId);
}
