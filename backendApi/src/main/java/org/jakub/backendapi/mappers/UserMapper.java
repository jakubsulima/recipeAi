package org.jakub.backendapi.mappers;

import org.jakub.backendapi.dto.SignUpDto;
import org.jakub.backendapi.dto.UserDto;
import org.jakub.backendapi.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toUserDto(User user);

    @Mapping(target = "password")
    User signUpDtoToUser(SignUpDto userDto);

    User signUpToUser(SignUpDto userDto);
}
