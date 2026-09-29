package com.fieldops.domain.entity;

import com.fieldops.domain.enums.ResponseType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "inspection_item_snapshots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InspectionItemSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspection_id", nullable = false)
    private Inspection inspection;

    @Column(name = "source_template_item_id")
    private UUID sourceTemplateItemId;

    @Column(name = "section_title", nullable = false)
    private String sectionTitle;

    @Column(name = "section_description", columnDefinition = "TEXT")
    private String sectionDescription;

    @Column(name = "section_order", nullable = false)
    @Builder.Default
    private Integer sectionOrder = 0;

    @Column(name = "item_code")
    private String itemCode;

    @Column(name = "item_title", nullable = false, columnDefinition = "TEXT")
    private String itemTitle;

    @Column(name = "item_description", columnDefinition = "TEXT")
    private String itemDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "response_type", nullable = false)
    private ResponseType responseType;

    @Column(nullable = false)
    @Builder.Default
    private Boolean required = false;

    @Column(name = "rules_json", columnDefinition = "jsonb")
    @Builder.Default
    private String rulesJson = "{}";

    @Column(name = "options_json", columnDefinition = "jsonb")
    @Builder.Default
    private String optionsJson = "[]";

    @Column(name = "item_order", nullable = false)
    @Builder.Default
    private Integer itemOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
