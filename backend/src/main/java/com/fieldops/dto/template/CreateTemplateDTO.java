package com.fieldops.dto.template;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTemplateDTO {

    @NotBlank(message = "O título do modelo é obrigatório")
    private String title;

    private String description;

    @NotBlank(message = "A categoria é obrigatória")
    private String category;

    @Builder.Default
    private List<CreateSectionDTO> sections = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateSectionDTO {
        private String title;
        private String description;
        private int displayOrder;
        private List<CreateItemDTO> items = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateItemDTO {
        private String code;
        private String title;
        private String description;
        private String responseType;
        private boolean required;
        private boolean observationRequiredOnFailure;
        private boolean evidenceRequiredOnFailure;
        private String optionsJson;
        private int displayOrder;
    }
}
