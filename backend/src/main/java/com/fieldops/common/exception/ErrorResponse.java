package com.fieldops.common.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Estrutura oficial de erro da API conforme especificado na Seção 12.2.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private OffsetDateTime timestamp;
    private int status;
    private String code;
    private String message;
    private String path;
    private String requestId;
    private List<FieldErrorItem> fieldErrors;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class FieldErrorItem {
        private String field;
        private String message;
    }
}
