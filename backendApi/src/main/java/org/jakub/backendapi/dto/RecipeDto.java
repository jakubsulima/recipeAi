package org.jakub.backendapi.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class RecipeDto {
    private Long id; // Added id field
    private String name;
    private List<RecipeIngredientDto> ingredients = new ArrayList<>();
    private List<String> instructions = new ArrayList<>();
    private String description;
    private String timeToPrepare;
    private int servings;

    public RecipeDto() {
    }

    public RecipeDto(Long id, String name, List<RecipeIngredientDto> ingredients, List<String> instructions, String description, String timeToPrepare, int servings) {
        this.id = id;
        this.name = name;
        this.ingredients = ingredients;
        this.instructions = instructions;
        this.description = description;
        this.timeToPrepare = timeToPrepare;
        this.servings = servings;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<RecipeIngredientDto> getIngredients() {
        return ingredients;
    }

    public void setIngredients(List<RecipeIngredientDto> ingredients) {
        this.ingredients = ingredients;
    }

    public List<String> getInstructions() {
        return instructions;
    }

    public void setInstructions(List<String> instructions) {
        this.instructions = instructions;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTimeToPrepare() {
        return timeToPrepare;
    }

    public void setTimeToPrepare(String timeToPrepare) {
        this.timeToPrepare = timeToPrepare;
    }

    public int getServings() {
        return servings;
    }

    public void setServings(int servings) {
        this.servings = servings;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RecipeDto recipeDto = (RecipeDto) o;
        return servings == recipeDto.servings && Objects.equals(id, recipeDto.id) && Objects.equals(name, recipeDto.name) && Objects.equals(ingredients, recipeDto.ingredients) && Objects.equals(instructions, recipeDto.instructions) && Objects.equals(description, recipeDto.description) && Objects.equals(timeToPrepare, recipeDto.timeToPrepare);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, ingredients, instructions, description, timeToPrepare, servings);
    }

    @Override
    public String toString() {
        return "RecipeDto{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", ingredients=" + ingredients +
                ", instructions=" + instructions +
                ", description='" + description + '\'' +
                ", timeToPrepare='" + timeToPrepare + '\'' +
                ", servings=" + servings +
                '}';
    }
}
