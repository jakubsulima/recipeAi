package org.jakub.backendapi.dto;

import java.util.List;
import java.util.Objects;

public class RecipeGenerationRequestDto {
    private String prompt;
    private List<String> fridgeItems;

    public RecipeGenerationRequestDto() {
    }

    public RecipeGenerationRequestDto(String prompt, List<String> fridgeItems) {
        this.prompt = prompt;
        this.fridgeItems = fridgeItems;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public List<String> getFridgeItems() {
        return fridgeItems;
    }

    public void setFridgeItems(List<String> fridgeItems) {
        this.fridgeItems = fridgeItems;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RecipeGenerationRequestDto that = (RecipeGenerationRequestDto) o;
        return Objects.equals(prompt, that.prompt) && Objects.equals(fridgeItems, that.fridgeItems);
    }

    @Override
    public int hashCode() {
        return Objects.hash(prompt, fridgeItems);
    }

    @Override
    public String toString() {
        return "RecipeGenerationRequestDto{" +
                "prompt='" + prompt + '\'' +
                ", fridgeItems=" + fridgeItems +
                '}';
    }
}
