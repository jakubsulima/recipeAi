package org.jakub.backendapi.mappers;

import org.jakub.backendapi.dto.UserDto;
import org.jakub.backendapi.entities.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toUserDto(User user);
}
