package org.jakub.backendapi.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.jakub.backendapi.config.CommaSeparatedStringToArrayDeserializer;

@AllArgsConstructor
@Data
@NoArgsConstructor
@Builder
public class UserPreferencesDto {

    private String diet;
    @JsonDeserialize(using = CommaSeparatedStringToArrayDeserializer.class)
    private String[] dislikedIngredients;

}
