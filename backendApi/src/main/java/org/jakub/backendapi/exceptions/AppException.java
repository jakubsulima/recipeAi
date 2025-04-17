package org.jakub.backendapi.exceptions;

import org.springframework.http.HttpStatus;

public class AppException extends RuntimeException {
    private final HttpStatus code;

    public AppException(String message, HttpStatus code) {
        super(message);
        this.code = code;
    }

    public HttpStatus getCode() {
        return code;
    }

    @Override
public String getMessage() {
    return String.format("Error: %s (HTTP %s)", super.getMessage(), code.value());
}
}
