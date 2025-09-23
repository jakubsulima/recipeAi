package org.jakub.backendapi.dto;

import java.util.Objects;

public class RecipeResponseDto {
    private String message;
    private RecipeDto recipeDto;

    public RecipeResponseDto() {
    }

    public RecipeResponseDto(String message, RecipeDto recipeDto) {
        this.message = message;
        this.recipeDto = recipeDto;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public RecipeDto getRecipeDto() {
        return recipeDto;
    }

    public void setRecipeDto(RecipeDto recipeDto) {
        this.recipeDto = recipeDto;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RecipeResponseDto that = (RecipeResponseDto) o;
        return Objects.equals(message, that.message) && Objects.equals(recipeDto, that.recipeDto);
    }

    @Override
    public int hashCode() {
        return Objects.hash(message, recipeDto);
    }

    @Override
    public String toString() {
        return "RecipeResponseDto{" +
                "message='" + message + '\'' +
                ", recipeDto=" + recipeDto +
                '}';
    }
}
