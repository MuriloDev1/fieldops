package com.fieldops.repository;

import com.fieldops.domain.entity.InspectionItemSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InspectionItemSnapshotRepository extends JpaRepository<InspectionItemSnapshot, UUID> {

    List<InspectionItemSnapshot> findByInspectionIdOrderBySectionOrderAscItemOrderAsc(UUID inspectionId);

    long countByInspectionIdAndRequiredTrue(UUID inspectionId);
}
