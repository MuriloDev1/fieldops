package com.fieldops.repository;

import com.fieldops.domain.entity.Equipment;
import com.fieldops.domain.enums.EquipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, UUID> {

    @Query("SELECT e FROM Equipment e JOIN FETCH e.site s JOIN FETCH s.client ORDER BY e.createdAt DESC")
    List<Equipment> findAllWithSiteAndClient();

    @Query("SELECT e FROM Equipment e JOIN FETCH e.site s JOIN FETCH s.client WHERE e.site.id = :siteId ORDER BY e.createdAt DESC")
    List<Equipment> findBySiteId(@Param("siteId") UUID siteId);

    @Query("SELECT e FROM Equipment e JOIN FETCH e.site s JOIN FETCH s.client WHERE s.client.id = :clientId ORDER BY e.createdAt DESC")
    List<Equipment> findByClientId(@Param("clientId") UUID clientId);

    @Query("SELECT e FROM Equipment e JOIN FETCH e.site s JOIN FETCH s.client WHERE e.qrCode = :qrCode")
    Optional<Equipment> findByQrCode(@Param("qrCode") String qrCode);

    boolean existsByQrCode(String qrCode);

    List<Equipment> findByStatus(EquipmentStatus status);

    long countBySiteId(UUID siteId);
}
