package org.jakub.backendapi.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import org.jakub.backendapi.config.CommaSeparatedStringToArrayDeserializer;

import java.util.Arrays;
import java.util.Objects;

public class UserPreferencesDto {

    private String diet;
    @JsonDeserialize(using = CommaSeparatedStringToArrayDeserializer.class)
    private String[] dislikedIngredients;

    public UserPreferencesDto() {
    }

    public UserPreferencesDto(String diet, String[] dislikedIngredients) {
        this.diet = diet;
        this.dislikedIngredients = dislikedIngredients;
    }

    public String getDiet() {
        return diet;
    }

    public void setDiet(String diet) {
        this.diet = diet;
    }

    public String[] getDislikedIngredients() {
        return dislikedIngredients;
    }

    public void setDislikedIngredients(String[] dislikedIngredients) {
        this.dislikedIngredients = dislikedIngredients;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserPreferencesDto that = (UserPreferencesDto) o;
        return Objects.equals(diet, that.diet) && Arrays.equals(dislikedIngredients, that.dislikedIngredients);
    }

    @Override
    public int hashCode() {
        int result = Objects.hash(diet);
        result = 31 * result + Arrays.hashCode(dislikedIngredients);
        return result;
    }

    @Override
    public String toString() {
        return "UserPreferencesDto{" +
                "diet='" + diet + '\'' +
                ", dislikedIngredients=" + Arrays.toString(dislikedIngredients) +
                '}';
    }
}
