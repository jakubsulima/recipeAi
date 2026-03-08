package org.jakub.backendapi.dto;

import jakarta.validation.constraints.NotEmpty;

public class OAuthLoginDto {

    @NotEmpty(message = "ID token cannot be empty")
    private String idToken;

    public OAuthLoginDto() {
    }

    public OAuthLoginDto(String idToken) {
        this.idToken = idToken;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}
