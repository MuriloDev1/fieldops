package com.fieldops.dto.review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDecisionRequestDTO {

    private String reason; // Obrigatório na reprovação
    private String comments;
    @Builder.Default
    private List<UUID> itemsToCorrect = new ArrayList<>();
}
