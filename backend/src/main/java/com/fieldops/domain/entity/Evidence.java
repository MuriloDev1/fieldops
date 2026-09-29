package com.fieldops.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "evidences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evidence {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_id", nullable = false)
    private Inspection inspection;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "response_id")
    private InspectionResponse response;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "non_conformity_id")
    private NonConformity nonConformity;

    @Column(nullable = false)
    @Builder.Default
    private String type = "PHOTO";

    @Column(name = "storage_key", nullable = false)
    private String storageKey;

    @Column(name = "original_file_name")
    private String originalFileName;

    @Column(name = "mime_type", nullable = false)
    private String mimeType;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    private String checksum;

    private String description;

    private BigDecimal latitude;

    private BigDecimal longitude;

    @Column(name = "captured_at_device")
    private OffsetDateTime capturedAtDevice;

    @Column(name = "server_received_at", nullable = false)
    @Builder.Default
    private OffsetDateTime serverReceivedAt = OffsetDateTime.now();

    @Column(name = "uploaded_at")
    private OffsetDateTime uploadedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
