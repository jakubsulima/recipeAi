package org.jakub.backendapi.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;

public class CommaSeparatedStringToArrayDeserializer extends JsonDeserializer<String[]> {

    @Override
    public String[] deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getText();
        if (value == null || value.trim().isEmpty()) {
            return new String[0];
        }
        // Split by comma, and trim whitespace from each element.
        return value.trim().split("\\s*,\\s*");
    }
}

