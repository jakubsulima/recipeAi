package org.jakub.backendapi.mappers;

import org.jakub.backendapi.dto.RecipeDto;
import org.jakub.backendapi.entities.Recipe;
import org.jakub.backendapi.entities.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RecipeMapper {
    RecipeDto toRecipeDto(Recipe recipe);

    Recipe toRecipe(RecipeDto recipeDto);

    default Recipe toRecipeWithUser(RecipeDto recipeDto, User user) {
    Recipe recipe = toRecipe(recipeDto); // map the fields first
    recipe.setUser(user);                // then add the user
    return recipe;
}
}
