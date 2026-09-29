package com.fieldops.dto.sync;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncPushResponseDTO {

    @Builder.Default
    private List<OperationResultDTO> results = new ArrayList<>();
    private String nextCursor;
    private OffsetDateTime serverTime;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OperationResultDTO {
        private UUID operationId;
        private String status; // APPLIED, ALREADY_APPLIED, REJECTED, CONFLICT
        private int entityVersion;
    }
}
