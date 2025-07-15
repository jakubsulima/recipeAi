package org.jakub.backendapi.mappers;

import org.jakub.backendapi.dto.UserPreferencesDto;
import org.jakub.backendapi.entities.UserPreferences;
import org.jakub.backendapi.entities.Diet;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Arrays;
import java.util.List;

@Mapper(componentModel = "spring")
public interface UserPreferencesMapper {

    UserPreferencesDto toUserPreferencesDto(UserPreferences userPreferences);

    @Mapping(target = "user", ignore = true)
    @Mapping(target="diet", source = "diet", qualifiedByName = "stringToDiet")
    UserPreferences toUserPreferences(UserPreferencesDto userPreferencesDto);

    default List<String> map(String value) {
        if (value == null || value.isEmpty()) {
            return List.of();
        }
        return Arrays.asList(value.split(","));
    }

    default String map(List<String> value) {
        if (value == null) {
            return null;
        }
        return String.join(",", value);
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
