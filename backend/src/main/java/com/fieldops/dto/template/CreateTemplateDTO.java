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

    private String category;

    @Builder.Default
    private List<CreateSectionDTO> sections = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateSectionDTO {
        private String title;
        private String description;
        private int displayOrder;
        private Integer orderIndex;
        @Builder.Default
        private List<CreateItemDTO> items = new ArrayList<>();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateItemDTO {
        private String code;
        private String title;
        private String text;
        private String description;
        private String responseType;
        private boolean required;
        private boolean observationRequiredOnFailure;
        private boolean evidenceRequiredOnFailure;
        private String optionsJson;
        private int displayOrder;
        private Integer orderIndex;
    }
}
