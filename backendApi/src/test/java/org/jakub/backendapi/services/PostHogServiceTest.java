package org.jakub.backendapi.services;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class PostHogServiceTest {

    @Test
    void captureIdentifiedEvent_shouldPostExpectedPayloadWhenEnabled() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.createServer(restTemplate);
        PostHogService service = new PostHogService(
                restTemplate,
                true,
                "https://eu.i.posthog.com",
                "project-key"
        );

        server.expect(requestTo("https://eu.i.posthog.com/i/v0/e/"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("\"api_key\":\"project-key\"")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("\"event\":\"recipe_saved\"")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("\"distinct_id\":\"42\"")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("\"captureSource\":\"backend\"")))
                .andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));

        service.captureIdentifiedEvent("42", "recipe_saved", Map.of("ingredientCount", 5));

        server.verify();
    }

    @Test
    void captureIdentifiedEvent_shouldSkipWhenDisabled() {
        RestTemplate restTemplate = new RestTemplate();
        MockRestServiceServer server = MockRestServiceServer.createServer(restTemplate);
        PostHogService service = new PostHogService(
                restTemplate,
                false,
                "https://eu.i.posthog.com",
                "project-key"
        );

        service.captureIdentifiedEvent("42", "recipe_saved", Map.of("ingredientCount", 5));

        server.verify();
    }
}
