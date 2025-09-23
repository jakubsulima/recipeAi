package org.jakub.backendapi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;

import java.util.Arrays;
import java.util.Objects;

public class SignUpDto {
    @NotEmpty
    @Email(message = "Email should be valid")
    private String email;
    @NotEmpty
    private char[] password;

    public SignUpDto() {
    }

    public SignUpDto(String email, char[] password) {
        this.email = email;
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public char[] getPassword() {
        return password;
    }

    public void setPassword(char[] password) {
        this.password = password;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SignUpDto signUpDto = (SignUpDto) o;
        return Objects.equals(email, signUpDto.email) && Arrays.equals(password, signUpDto.password);
    }

    @Override
    public int hashCode() {
        int result = Objects.hash(email);
        result = 31 * result + Arrays.hashCode(password);
        return result;
    }

    @Override
    public String toString() {
        return "SignUpDto{" +
                "email='" + email + '\'' +
                ", password=" + Arrays.toString(password) +
                '}';
    }
}
