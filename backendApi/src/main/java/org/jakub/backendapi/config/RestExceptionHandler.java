package org.jakub.backendapi.config;

import org.jakub.backendapi.dto.ErrorDto;
import org.jakub.backendapi.exceptions.AppException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

@ControllerAdvice
public class RestExceptionHandler {
    @ExceptionHandler(value = {AppException.class})
    @ResponseBody
    public ResponseEntity<ErrorDto> handleAppException(AppException e) {
        return ResponseEntity.status(e.getCode())
                .body(new ErrorDto(e.getMessage()));
    }
}
