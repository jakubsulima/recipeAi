package org.jakub.backendapi.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecipeGenerationRequestDto {
    private String prompt;
    private List<String> fridgeItems;
}
