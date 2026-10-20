package com.fieldops.repository;

import com.fieldops.domain.entity.InspectionResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InspectionResponseRepository extends JpaRepository<InspectionResponse, UUID> {

    @Query("SELECT r FROM InspectionResponse r JOIN FETCH r.inspectionItem WHERE r.inspection.id = :inspectionId")
    List<InspectionResponse> findByInspectionIdWithItem(@Param("inspectionId") UUID inspectionId);

    Optional<InspectionResponse> findByInspectionItemId(UUID inspectionItemId);

    long countByInspectionId(UUID inspectionId);
}
