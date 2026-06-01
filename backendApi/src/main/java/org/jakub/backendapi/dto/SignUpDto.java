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
    private boolean acceptedTerms;
    private boolean acceptedPrivacy;

    public SignUpDto() {
    }

    public SignUpDto(String email, char[] password) {
        this.email = email;
        this.password = password;
    }

    public SignUpDto(String email, char[] password, boolean acceptedTerms, boolean acceptedPrivacy) {
        this.email = email;
        this.password = password;
        this.acceptedTerms = acceptedTerms;
        this.acceptedPrivacy = acceptedPrivacy;
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

    public boolean isAcceptedTerms() {
        return acceptedTerms;
    }

    public void setAcceptedTerms(boolean acceptedTerms) {
        this.acceptedTerms = acceptedTerms;
    }

    public boolean isAcceptedPrivacy() {
        return acceptedPrivacy;
    }

    public void setAcceptedPrivacy(boolean acceptedPrivacy) {
        this.acceptedPrivacy = acceptedPrivacy;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SignUpDto signUpDto = (SignUpDto) o;
        return acceptedTerms == signUpDto.acceptedTerms
                && acceptedPrivacy == signUpDto.acceptedPrivacy
                && Objects.equals(email, signUpDto.email)
                && Arrays.equals(password, signUpDto.password);
    }

    @Override
    public int hashCode() {
        int result = Objects.hash(email);
        result = 31 * result + Arrays.hashCode(password);
        result = 31 * result + Boolean.hashCode(acceptedTerms);
        result = 31 * result + Boolean.hashCode(acceptedPrivacy);
        return result;
    }

    @Override
    public String toString() {
        return "SignUpDto{" +
                "email='" + email + '\'' +
                ", acceptedTerms=" + acceptedTerms +
                ", acceptedPrivacy=" + acceptedPrivacy +
                '}';
    }
}
