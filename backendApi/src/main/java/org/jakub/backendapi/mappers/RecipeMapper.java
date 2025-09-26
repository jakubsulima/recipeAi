package org.jakub.backendapi.mappers;

import org.jakub.backendapi.dto.RecipeDto;
import org.jakub.backendapi.dto.RecipeIngredientDto;
import org.jakub.backendapi.dto.RecipeResponseDto;
import org.jakub.backendapi.entities.Recipe;
import org.jakub.backendapi.entities.RecipeIngredient;
import org.jakub.backendapi.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RecipeMapper {
    @Mapping(target = "ingredients", source = "recipeIngredients")
    @Mapping(target = "instructions", source = "instructions")
    RecipeDto toRecipeDto(Recipe recipe);

    @Mapping(target = "recipeDto", source = "recipe")
    RecipeResponseDto toResponseDto(String message, Recipe recipe);

    @Mapping(target = "recipeIngredients", source = "ingredients")
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "id", ignore = true)
    Recipe toRecipe(RecipeDto recipeDto);

    @Mapping(source = "ingredient.name", target = "name")
    RecipeIngredientDto recipeIngredientToRecipeIngredientDto(RecipeIngredient recipeIngredient);

    default Recipe toRecipeWithUser(RecipeDto recipeDto, User user) {
        Recipe recipe = toRecipe(recipeDto);
        recipe.setUser(user);
        recipe.setInstructions(recipeDto.getInstructions());
        return recipe;
    }
}
