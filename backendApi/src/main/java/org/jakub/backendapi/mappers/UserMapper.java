package org.jakub.backendapi.mappers;

import org.jakub.backendapi.dto.SignUpDto;
import org.jakub.backendapi.dto.UserDto;
import org.jakub.backendapi.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = UserPreferencesMapper.class)
public interface UserMapper {
    UserDto toUserDto(User user);

    @Mapping(target = "password", ignore = true)
    @Mapping(target = "role", ignore = true) // Add this line to ignore role during signUpToUser mapping
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "recipes", ignore = true)
    @Mapping(target = "userPreferences", ignore = true)
    @Mapping(target = "fridgeIngredients", ignore = true)
    User signUpToUser(SignUpDto userDto);

}
