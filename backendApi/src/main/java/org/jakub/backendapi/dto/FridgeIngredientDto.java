package org.jakub.backendapi.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FridgeIngredientDto {
    private Long id;
    private String name;
    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate expirationDate;
    private String unit;
    private double amount;
}

