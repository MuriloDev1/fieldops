package com.fieldops.repository;

import com.fieldops.domain.entity.InspectionSite;
import com.fieldops.domain.enums.SiteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InspectionSiteRepository extends JpaRepository<InspectionSite, UUID> {

    @Query("SELECT s FROM InspectionSite s JOIN FETCH s.client ORDER BY s.createdAt DESC")
    List<InspectionSite> findAllWithClient();

    @Query("SELECT s FROM InspectionSite s JOIN FETCH s.client WHERE s.client.id = :clientId ORDER BY s.createdAt DESC")
    List<InspectionSite> findByClientId(@Param("clientId") UUID clientId);

    List<InspectionSite> findByStatus(SiteStatus status);

    long countByClientId(UUID clientId);
}
