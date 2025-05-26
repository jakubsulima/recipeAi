package org.jakub.backendapi.controllers;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.jakub.backendapi.config.JwtUtils;
import org.jakub.backendapi.dto.FridgeIngredientDto;
import org.jakub.backendapi.entities.FridgeIngredient;
import org.jakub.backendapi.services.FridgeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.jakub.backendapi.config.JwtUtils.getLoginFromToken;

@RestController
@RequiredArgsConstructor
public class FridgeController {
    private final FridgeService fridgeService;

    @GetMapping("/getFridgeIngredients")
    public ResponseEntity<List<FridgeIngredientDto>> getFridgeIngredients(HttpServletRequest request) {
        String email = getLoginFromToken(request);
        List<FridgeIngredientDto> fridgeIngredients = fridgeService.getFridgeIngredients(email);
        return ResponseEntity.ok(fridgeIngredients);
    }

    @PostMapping("/addFridgeIngredient")
    public ResponseEntity<FridgeIngredientDto> addFridgeIngredient(@RequestBody FridgeIngredientDto fridgeIngredientDto, HttpServletRequest request) {
        String email = getLoginFromToken(request);
        System.out.println("Adding fridge ingredient: " + fridgeIngredientDto);
        fridgeService.addFridgeIngredient(fridgeIngredientDto, email);
        return ResponseEntity.ok(fridgeIngredientDto);
    }

    @PostMapping("/deleteFridgeIngredient/{ingredientId}")
    public ResponseEntity<FridgeIngredientDto> deleteFridgeIngredient(@PathVariable Long ingredientId, HttpServletRequest request) {
        fridgeService.deleteFridgeIngredient(ingredientId, getLoginFromToken(request));
        return ResponseEntity.noContent().build();
    }

}
