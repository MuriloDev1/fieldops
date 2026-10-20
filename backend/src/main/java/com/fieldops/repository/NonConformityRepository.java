package com.fieldops.repository;

import com.fieldops.domain.entity.NonConformity;
import com.fieldops.domain.enums.NonConformitySeverity;
import com.fieldops.domain.enums.NonConformityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NonConformityRepository extends JpaRepository<NonConformity, UUID> {

    List<NonConformity> findByInspectionIdOrderByCreatedAtDesc(UUID inspectionId);

    List<NonConformity> findByStatus(NonConformityStatus status);

    List<NonConformity> findBySeverity(NonConformitySeverity severity);

    long countByStatus(NonConformityStatus status);

    long countBySeverity(NonConformitySeverity severity);
}
