package org.jakub.backendapi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class SignUpDto {
    @NotEmpty
    @Email(message = "Email should be valid")
    private String email;
    @NotEmpty
    private char[] password;
}
