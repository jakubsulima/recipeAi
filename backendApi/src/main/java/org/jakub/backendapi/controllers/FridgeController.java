package org.jakub.backendapi.controllers;

import jakarta.servlet.http.HttpServletRequest;
import org.jakub.backendapi.dto.FridgeIngredientDto;
import org.jakub.backendapi.services.FridgeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.jakub.backendapi.config.JwtUtils.getLoginFromToken;

@RestController
public class FridgeController {
    private final FridgeService fridgeService;

    public FridgeController(FridgeService fridgeService) {
        this.fridgeService = fridgeService;
    }

    @GetMapping("/getFridgeIngredients")
    public ResponseEntity<List<FridgeIngredientDto>> getFridgeIngredients(HttpServletRequest request) {
        List<FridgeIngredientDto> fridgeIngredients = fridgeService.getFridgeIngredients(getLoginFromToken(request));
        return ResponseEntity.ok(fridgeIngredients);
    }

    @GetMapping("/getFridgeIngredientsGroupedByCategory")
    public ResponseEntity<?> getFridgeIngredientsGroupedByCategory(HttpServletRequest request) {
        var groupedIngredients = fridgeService.getFridgeIngredientGroupedByCategory(getLoginFromToken(request));
        return ResponseEntity.ok(groupedIngredients);
    }

    @PostMapping("/addFridgeIngredient")
    public ResponseEntity<FridgeIngredientDto> addFridgeIngredient(@RequestBody FridgeIngredientDto fridgeIngredientDto, HttpServletRequest request) {
        fridgeService.addFridgeIngredient(fridgeIngredientDto, getLoginFromToken(request));
        return ResponseEntity.ok(fridgeIngredientDto);
    }

    @PostMapping("/deleteFridgeIngredient/{ingredientId}")
    public ResponseEntity<FridgeIngredientDto> deleteFridgeIngredient(@PathVariable Long ingredientId, HttpServletRequest request) {
        fridgeService.deleteFridgeIngredient(ingredientId, getLoginFromToken(request));
        return ResponseEntity.noContent().build();
    }

}
