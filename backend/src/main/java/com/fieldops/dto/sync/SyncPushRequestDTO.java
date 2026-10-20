package com.fieldops.dto.sync;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncPushRequestDTO {

    private UUID deviceId;
    private String lastPullCursor;
    @Builder.Default
    private List<SyncOperationDTO> operations = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SyncOperationDTO {
        private UUID operationId;
        private String entityType; // INSPECTION_RESPONSE, NON_CONFORMITY, EVIDENCE
        private UUID entityId;
        private String operationType; // CREATE, UPDATE, UPSERT
        private int baseVersion;
        private Map<String, Object> payload;
    }
}
