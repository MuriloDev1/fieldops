package com.fieldops.repository;

import com.fieldops.domain.entity.Inspection;
import com.fieldops.domain.enums.InspectionPriority;
import com.fieldops.domain.enums.InspectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InspectionRepository extends JpaRepository<Inspection, UUID> {

    @Query("SELECT i FROM Inspection i JOIN FETCH i.client JOIN FETCH i.site LEFT JOIN FETCH i.equipment JOIN FETCH i.technician JOIN FETCH i.supervisor ORDER BY i.createdAt DESC")
    List<Inspection> findAllWithDetails();

    @Query("SELECT i FROM Inspection i JOIN FETCH i.client JOIN FETCH i.site LEFT JOIN FETCH i.equipment JOIN FETCH i.technician JOIN FETCH i.supervisor WHERE i.id = :id")
    Optional<Inspection> findByIdWithDetails(@Param("id") UUID id);

    List<Inspection> findByTechnicianIdOrderByScheduledForDesc(UUID technicianId);

    List<Inspection> findBySupervisorIdOrderByCreatedAtDesc(UUID supervisorId);

    List<Inspection> findByStatus(InspectionStatus status);

    List<Inspection> findByClientId(UUID clientId);

    List<Inspection> findBySiteId(UUID siteId);

    List<Inspection> findByEquipmentId(UUID equipmentId);

    long countByStatus(InspectionStatus status);

    long countByPriority(InspectionPriority priority);
}
