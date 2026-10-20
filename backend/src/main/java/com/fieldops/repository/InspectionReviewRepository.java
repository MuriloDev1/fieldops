package com.fieldops.repository;

import com.fieldops.domain.entity.InspectionReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InspectionReviewRepository extends JpaRepository<InspectionReview, UUID> {

    List<InspectionReview> findByInspectionIdOrderByReviewCycleAsc(UUID inspectionId);

    long countByInspectionId(UUID inspectionId);
}
