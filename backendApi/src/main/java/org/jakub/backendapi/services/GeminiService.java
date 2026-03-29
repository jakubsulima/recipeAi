package org.jakub.backendapi.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.jakub.backendapi.dto.FridgeIngredientDto;
import org.jakub.backendapi.entities.Enums.Unit;
import org.jakub.backendapi.exceptions.AppException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GeminiService {

    private static final Set<String> SUPPORTED_UNITS =
            java.util.Arrays.stream(Unit.values()).map(Enum::name).collect(Collectors.toSet());

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.model:gemini-3-flash-preview}")
    private String geminiModel;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public GeminiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    public String generateRecipe(String recipePrompt) {
        if (!StringUtils.hasText(geminiApiKey)) {
            throw new AppException("Gemini API key is not configured on the server.", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        try (Client client = Client.builder().apiKey(geminiApiKey).build()) {
            GenerateContentResponse response = client.models.generateContent(geminiModel, recipePrompt, null);
            if (response == null || !StringUtils.hasText(response.text())) {
                throw new AppException("Gemini returned an empty recipe response.", HttpStatus.INTERNAL_SERVER_ERROR);
            }
            return response.text();
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException("Error creating recipe: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public List<FridgeIngredientDto> extractFridgeIngredientsFromReceipt(MultipartFile file) {
        validateReceiptFile(file);

        if (!StringUtils.hasText(geminiApiKey)) {
            throw new AppException("Gemini API key is not configured on the server.", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        String mimeType = StringUtils.hasText(file.getContentType()) ? file.getContentType() : MediaType.IMAGE_JPEG_VALUE;
        String base64Data;
        try {
            base64Data = Base64.getEncoder().encodeToString(file.getBytes());
        } catch (IOException e) {
            throw new AppException("Could not read uploaded receipt image.", HttpStatus.BAD_REQUEST);
        }

        String prompt = """
                You are extracting grocery receipt items for a cooking app.
                Return ONLY strict JSON with this exact structure:
                {"items":[{"name":"string","amount":number|null,"unit":"GRAMS|KILOGRAMS|LITERS|MILLILITERS|PIECES|null"}]}
                Rules:
                - Keep only food ingredients, skip non-food products.
                - If amount is unknown, return null.
                - If unit is unknown, return null.
                - Use one object per detected item.
                - Do not add any text outside JSON.
                """;

        Map<String, Object> inlineData = new HashMap<>();
        inlineData.put("mime_type", mimeType);
        inlineData.put("data", base64Data);

        List<Object> parts = new ArrayList<>();
        parts.add(Map.of("text", prompt));
        parts.add(Map.of("inline_data", inlineData));

        Map<String, Object> content = new HashMap<>();
        content.put("parts", parts);

        Map<String, Object> payload = new HashMap<>();
        payload.put("contents", List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        String endpoint = UriComponentsBuilder
                .fromHttpUrl("https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent")
                .queryParam("key", geminiApiKey)
                .buildAndExpand(geminiModel)
                .toUriString();

        JsonNode responseBody;
        try {
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(endpoint, request, JsonNode.class);
            responseBody = response.getBody();
        } catch (RestClientException e) {
            throw new AppException("Gemini receipt scan request failed: " + e.getMessage(), HttpStatus.BAD_GATEWAY);
        }

        String rawJsonText = extractTextFromGeminiResponse(responseBody);
        return parseReceiptItems(rawJsonText);
    }

    private void validateReceiptFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException("Receipt image is required.", HttpStatus.BAD_REQUEST);
        }

        String contentType = file.getContentType();
        if (!StringUtils.hasText(contentType) || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new AppException("Only image files are supported for receipt scanning.", HttpStatus.BAD_REQUEST);
        }
    }

    private String extractTextFromGeminiResponse(JsonNode responseBody) {
        if (responseBody == null) {
            throw new AppException("Gemini returned an empty response.", HttpStatus.BAD_GATEWAY);
        }

        JsonNode candidates = responseBody.path("candidates");
        if (!candidates.isArray() || candidates.isEmpty()) {
            throw new AppException("Gemini could not detect receipt content.", HttpStatus.BAD_GATEWAY);
        }

        JsonNode parts = candidates.get(0).path("content").path("parts");
        if (!parts.isArray() || parts.isEmpty()) {
            throw new AppException("Gemini returned an invalid receipt response format.", HttpStatus.BAD_GATEWAY);
        }

        StringBuilder combined = new StringBuilder();
        for (JsonNode part : parts) {
            String text = part.path("text").asText("");
            if (StringUtils.hasText(text)) {
                if (combined.length() > 0) {
                    combined.append("\n");
                }
                combined.append(text);
            }
        }

        if (combined.length() == 0) {
            throw new AppException("Gemini did not return any receipt items.", HttpStatus.BAD_GATEWAY);
        }

        return cleanJsonPayload(combined.toString());
    }

    private String cleanJsonPayload(String value) {
        String cleaned = value.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace("```json", "").replace("```", "").trim();
        }
        return cleaned;
    }

    private List<FridgeIngredientDto> parseReceiptItems(String payload) {
        JsonNode root;
        try {
            root = objectMapper.readTree(payload);
        } catch (IOException e) {
            throw new AppException("Could not parse receipt scan response from Gemini.", HttpStatus.BAD_GATEWAY);
        }

        JsonNode itemsNode;
        if (root.isArray()) {
            itemsNode = root;
        } else {
            itemsNode = root.path("items");
        }

        if (!itemsNode.isArray()) {
            throw new AppException("Gemini receipt response missing 'items' array.", HttpStatus.BAD_GATEWAY);
        }

        List<FridgeIngredientDto> parsedItems = new ArrayList<>();
        for (JsonNode itemNode : itemsNode) {
            String name = itemNode.path("name").asText("").trim();
            if (!StringUtils.hasText(name)) {
                continue;
            }

            FridgeIngredientDto dto = new FridgeIngredientDto();
            dto.setName(name);

            JsonNode amountNode = itemNode.get("amount");
            if (amountNode != null && !amountNode.isNull()) {
                dto.setAmount(amountNode.asDouble());
            }

            String unit = itemNode.path("unit").asText("").trim();
            if (StringUtils.hasText(unit)) {
                String normalizedUnit = unit.toUpperCase(Locale.ROOT);
                if (SUPPORTED_UNITS.contains(normalizedUnit)) {
                    dto.setUnit(Unit.valueOf(normalizedUnit).getAbbreviation());
                }
            }

            parsedItems.add(dto);
        }

        return parsedItems;
    }
}
