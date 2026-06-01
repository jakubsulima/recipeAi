package org.jakub.backendapi.dto;

import jakarta.validation.constraints.NotEmpty;

public class OAuthLoginDto {

    @NotEmpty(message = "ID token cannot be empty")
    private String idToken;
    private boolean acceptedTerms;
    private boolean acceptedPrivacy;

    public OAuthLoginDto() {
    }

    public OAuthLoginDto(String idToken) {
        this.idToken = idToken;
    }

    public OAuthLoginDto(String idToken, boolean acceptedTerms, boolean acceptedPrivacy) {
        this.idToken = idToken;
        this.acceptedTerms = acceptedTerms;
        this.acceptedPrivacy = acceptedPrivacy;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
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
}
