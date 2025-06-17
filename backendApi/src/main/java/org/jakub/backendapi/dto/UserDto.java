package org.jakub.backendapi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.jakub.backendapi.entities.Role;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class UserDto {

    private String email;
    private Long id;
    private Role role;
}
