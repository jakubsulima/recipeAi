package org.jakub.backendapi.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.jakub.backendapi.config.JwtUtils;
import org.jakub.backendapi.dto.RecipeDto;
import org.jakub.backendapi.dto.RecipeIngredientDto;
import org.jakub.backendapi.services.RecipeService;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RecipesController.class)
@Import(RecipesControllerTest.TestConfig.class)
class RecipesControllerTest {

    @Configuration
    static class TestConfig {
        @Bean
        public RecipeService recipeService() {
            return Mockito.mock(RecipeService.class);
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private RecipeService recipeService;

    @Test
    void testAddRecipe() throws Exception {
        // Create test data
        RecipeDto recipeDto = RecipeDto.builder()
                .name("Test Recipe")
                .ingredients(List.of(
                        RecipeIngredientDto.builder().name("Test Ingredient").amount(100).unit("g").build()
                ))
                .build();

        String testLogin = "testuser";

        // Mock JWT token extraction
        try (MockedStatic<JwtUtils> jwtUtilsMock = Mockito.mockStatic(JwtUtils.class)) {
            jwtUtilsMock.when(() -> JwtUtils.getTokenFromCookies(any(HttpServletRequest.class), eq("access_token")))
                    .thenReturn("test-token");
            jwtUtilsMock.when(() -> JwtUtils.getLoginFromToken("test-token"))
                    .thenReturn(testLogin);

            // Perform the request using MockMvc
            mockMvc.perform(post("/addRecipe")
                    .contentType(MediaType.APPLICATION_JSON)
                    .cookie(new Cookie("access_token", "test-token"))
                    .content(new ObjectMapper().writeValueAsString(recipeDto)))
                    .andExpect(status().isOk())
                    .andExpect(content().string("Added Recipe"));

            // Verify service was called with correct parameters
            verify(recipeService).saveRecipe(any(RecipeDto.class), eq(testLogin));
        }
    }
}