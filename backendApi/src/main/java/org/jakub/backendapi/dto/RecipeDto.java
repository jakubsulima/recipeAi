package org.jakub.backendapi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeDto {
    private Long id;
    private String name;
    private List<RecipeIngredientDto> ingredients = new ArrayList<>();
    private List<String> instructions = new ArrayList<>();
}
