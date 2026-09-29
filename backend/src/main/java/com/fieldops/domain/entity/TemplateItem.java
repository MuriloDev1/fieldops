package com.fieldops.domain.entity;

import com.fieldops.domain.enums.ResponseType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "template_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemplateItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private TemplateSection section;

    private String code;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "response_type", nullable = false)
    private ResponseType responseType;

    @Column(nullable = false)
    @Builder.Default
    private Boolean required = false;

    @Column(name = "observation_required_on_failure", nullable = false)
    @Builder.Default
    private Boolean observationRequiredOnFailure = false;

    @Column(name = "evidence_required_on_failure", nullable = false)
    @Builder.Default
    private Boolean evidenceRequiredOnFailure = false;

    @Column(name = "options_json", columnDefinition = "jsonb")
    @Builder.Default
    private String optionsJson = "[]";

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
