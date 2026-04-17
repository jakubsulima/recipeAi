package org.jakub.backendapi.mappers;

import org.jakub.backendapi.dto.UserPreferencesDto;
import org.jakub.backendapi.entities.Enums.Diet;
import org.jakub.backendapi.entities.UserPreferences;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

@Mapper(componentModel = "spring")
public interface UserPreferencesMapper {

    @Mapping(target = "diets", source = "diets", qualifiedByName = "dietsToStrings")
    @Mapping(target = "diet", source = "diets", qualifiedByName = "dietsToSummary")
    UserPreferencesDto toUserPreferencesDto(UserPreferences userPreferences);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "diet", source = "diet", qualifiedByName = "stringToDiet")
    @Mapping(target = "diets", source = "diets", qualifiedByName = "stringsToDiets")
    UserPreferences toUserPreferences(UserPreferencesDto userPreferencesDto);

    @Named("dietsToSummary")
    default String dietsToSummary(List<Diet> diets) {
        if (diets == null || diets.isEmpty()) {
            return Diet.NONE.name();
        }

        if (diets.size() == 1) {
            return diets.get(0).name();
        }

        return Diet.OTHER.name();
    }

    @Named("dietsToStrings")
    default String[] dietsToStrings(List<Diet> diets) {
        if (diets == null || diets.isEmpty()) {
            return new String[] {Diet.NONE.name()};
        }

        return diets.stream().map(Enum::name).toArray(String[]::new);
    }

    @Named("stringsToDiets")
    default List<Diet> stringsToDiets(String[] diets) {
        if (diets == null || diets.length == 0) {
            return new ArrayList<>(List.of(Diet.NONE));
        }

        List<Diet> parsed = new ArrayList<>();
        for (String dietValue : diets) {
            parsed.add(stringToDiet(dietValue));
        }

        List<Diet> deduplicated = new ArrayList<>(new LinkedHashSet<>(parsed));
        if (deduplicated.contains(Diet.NONE) && deduplicated.size() > 1) {
            return new ArrayList<>(List.of(Diet.NONE));
        }

        return deduplicated;
    }

    @Named("stringToDiet")
    default Diet stringToDiet(String diet) {
        if (diet == null || diet.trim().isEmpty()) {
            return Diet.NONE;
        }
        try {
            return Diet.valueOf(diet.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Diet.NONE;
        }
    }
}
