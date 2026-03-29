package org.jakub.backendapi.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.jakub.backendapi.dto.FridgeIngredientDto;
import org.jakub.backendapi.entities.Enums.Unit;
import org.jakub.backendapi.exceptions.AppException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
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

    private static final long MAX_RECEIPT_FILE_SIZE_BYTES = 5L * 1024L * 1024L;
    private static final int MAX_IMAGE_DIMENSION = 6000;
    private static final int MAX_RETRY_ATTEMPTS = 3;

    private static final Set<String> SUPPORTED_UNITS =
            java.util.Arrays.stream(Unit.values()).map(Enum::name).collect(Collectors.toSet());

    private static final Set<String> ALLOWED_IMAGE_CONTENT_TYPES = Set.of(
            MediaType.IMAGE_JPEG_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            "image/webp"
    );

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.model:gemini-3-flash-preview}")
    private String geminiModel;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public GeminiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000);
        requestFactory.setReadTimeout(15000);
        this.restTemplate = new RestTemplate(requestFactory);
    }

    public String generateRecipe(String recipePrompt) {
        if (!StringUtils.hasText(geminiApiKey)) {
            throw new AppException("Gemini API key is not configured on the server.", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        Map<String, Object> payload = buildTextPromptPayload(recipePrompt);
        JsonNode responseBody = invokeGemini(payload, "Error creating recipe");

        String textResponse = extractTextFromGeminiResponse(responseBody);
        if (!StringUtils.hasText(textResponse)) {
            throw new AppException("Gemini returned an empty recipe response.", HttpStatus.BAD_GATEWAY);
        }

        return textResponse;
    }

    public List<FridgeIngredientDto> extractFridgeIngredientsFromReceipt(MultipartFile file) {
        if (!StringUtils.hasText(geminiApiKey)) {
            throw new AppException("Gemini API key is not configured on the server.", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        ValidatedReceiptImage image = validateAndReadReceiptImage(file);

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

        String base64Data = Base64.getEncoder().encodeToString(image.bytes());

        Map<String, Object> inlineData = new HashMap<>();
        inlineData.put("mime_type", image.mimeType());
        inlineData.put("data", base64Data);

        List<Object> parts = new ArrayList<>();
        parts.add(Map.of("text", prompt));
        parts.add(Map.of("inline_data", inlineData));

        Map<String, Object> content = new HashMap<>();
        content.put("parts", parts);

        Map<String, Object> payload = new HashMap<>();
        payload.put("contents", List.of(content));

        JsonNode responseBody = invokeGemini(payload, "Gemini receipt scan request failed");
        String rawJsonText = cleanJsonPayload(extractTextFromGeminiResponse(responseBody));
        return parseReceiptItems(rawJsonText);
    }

    private Map<String, Object> buildTextPromptPayload(String prompt) {
        List<Object> parts = new ArrayList<>();
        parts.add(Map.of("text", prompt));

        Map<String, Object> content = new HashMap<>();
        content.put("parts", parts);

        Map<String, Object> payload = new HashMap<>();
        payload.put("contents", List.of(content));
        return payload;
    }

    private JsonNode invokeGemini(Map<String, Object> payload, String operationLabel) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", geminiApiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
        String endpoint = UriComponentsBuilder
                .fromHttpUrl("https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent")
                .buildAndExpand(geminiModel)
                .toUriString();

        long backoffMillis = 300L;
        for (int attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
            try {
                ResponseEntity<JsonNode> response = restTemplate.exchange(endpoint, HttpMethod.POST, request, JsonNode.class);
                return response.getBody();
            } catch (RestClientResponseException e) {
                boolean retryableStatus = e.getStatusCode().is5xxServerError() || e.getStatusCode().value() == 429;
                if (!retryableStatus || attempt == MAX_RETRY_ATTEMPTS) {
                    throw new AppException(operationLabel + ": " + e.getMessage(), HttpStatus.BAD_GATEWAY);
                }
                sleepWithBackoff(backoffMillis);
                backoffMillis *= 2;
            } catch (RestClientException e) {
                if (attempt == MAX_RETRY_ATTEMPTS) {
                    throw new AppException(operationLabel + ": " + e.getMessage(), HttpStatus.BAD_GATEWAY);
                }
                sleepWithBackoff(backoffMillis);
                backoffMillis *= 2;
            }
        }

        throw new AppException(operationLabel + ": retry limit exceeded", HttpStatus.BAD_GATEWAY);
    }

    private void sleepWithBackoff(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new AppException("Gemini request interrupted.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private ValidatedReceiptImage validateAndReadReceiptImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException("Receipt image is required.", HttpStatus.BAD_REQUEST);
        }

        if (file.getSize() > MAX_RECEIPT_FILE_SIZE_BYTES) {
            throw new AppException("Receipt image too large. Max size is 5MB.", HttpStatus.BAD_REQUEST);
        }

        String contentType = StringUtils.hasText(file.getContentType())
                ? file.getContentType().toLowerCase(Locale.ROOT)
                : "";

        if (!ALLOWED_IMAGE_CONTENT_TYPES.contains(contentType)) {
            throw new AppException("Only JPEG, PNG or WEBP images are supported for receipt scanning.", HttpStatus.BAD_REQUEST);
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new AppException("Could not read uploaded receipt image.", HttpStatus.BAD_REQUEST);
        }

        try (ByteArrayInputStream input = new ByteArrayInputStream(bytes)) {
            BufferedImage image = ImageIO.read(input);
            if (image == null) {
                throw new AppException("Uploaded file is not a valid image.", HttpStatus.BAD_REQUEST);
            }
            if (image.getWidth() > MAX_IMAGE_DIMENSION || image.getHeight() > MAX_IMAGE_DIMENSION) {
                throw new AppException("Receipt image dimensions are too large.", HttpStatus.BAD_REQUEST);
            }
        } catch (IOException e) {
            throw new AppException("Could not validate uploaded receipt image.", HttpStatus.BAD_REQUEST);
        }

        return new ValidatedReceiptImage(contentType, bytes);
    }

    private String extractTextFromGeminiResponse(JsonNode responseBody) {
        if (responseBody == null) {
            throw new AppException("Gemini returned an empty response.", HttpStatus.BAD_GATEWAY);
        }

        JsonNode candidates = responseBody.path("candidates");
        if (!candidates.isArray() || candidates.isEmpty()) {
            throw new AppException("Gemini could not detect content.", HttpStatus.BAD_GATEWAY);
        }

        JsonNode parts = candidates.get(0).path("content").path("parts");
        if (!parts.isArray() || parts.isEmpty()) {
            throw new AppException("Gemini returned an invalid response format.", HttpStatus.BAD_GATEWAY);
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
            throw new AppException("Gemini did not return any response text.", HttpStatus.BAD_GATEWAY);
        }

        return combined.toString();
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

        JsonNode itemsNode = root.isArray() ? root : root.path("items");

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

    private record ValidatedReceiptImage(String mimeType, byte[] bytes) {
    }
}
