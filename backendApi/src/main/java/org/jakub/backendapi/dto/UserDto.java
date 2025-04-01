package org.jakub.backendapi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class UserDto {

    private String firstName;
    private String lastName;
    private String login;
    private Long id;
    private String token;
    private String refreshToken;


}
