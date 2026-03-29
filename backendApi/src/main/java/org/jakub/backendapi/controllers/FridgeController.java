package org.jakub.backendapi.controllers;

import jakarta.servlet.http.HttpServletRequest;
import org.jakub.backendapi.dto.AmountDto;
import org.jakub.backendapi.dto.FridgeIngredientDto;
import org.jakub.backendapi.services.FridgeService;
import org.jakub.backendapi.services.GeminiService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static org.jakub.backendapi.config.JwtUtils.getLoginFromToken;

@RestController
public class FridgeController {
    private final FridgeService fridgeService;
    private final GeminiService geminiService;

    public FridgeController(FridgeService fridgeService, GeminiService geminiService) {
        this.fridgeService = fridgeService;
        this.geminiService = geminiService;
    }

    @GetMapping("/getFridgeIngredients")
    public ResponseEntity<List<FridgeIngredientDto>> getFridgeIngredients(HttpServletRequest request) {
        List<FridgeIngredientDto> fridgeIngredients = fridgeService.getFridgeIngredients(getLoginFromToken(request));
        return ResponseEntity.ok(fridgeIngredients);
    }

    @PostMapping("/addFridgeIngredient")
    public ResponseEntity<FridgeIngredientDto> addFridgeIngredient(@RequestBody FridgeIngredientDto fridgeIngredientDto, HttpServletRequest request) {
        fridgeService.addFridgeIngredient(fridgeIngredientDto, getLoginFromToken(request));
        return ResponseEntity.ok(fridgeIngredientDto);
    }

    @DeleteMapping("/deleteFridgeIngredient/{ingredientId}")
    public ResponseEntity<FridgeIngredientDto> deleteFridgeIngredient(@PathVariable Long ingredientId, HttpServletRequest request) {
        fridgeService.deleteFridgeIngredient(ingredientId, getLoginFromToken(request));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/updateFridgeIngredient/{ingredientId}")
    public ResponseEntity<FridgeIngredientDto> updateFridgeIngredient(@PathVariable Long ingredientId, @RequestBody AmountDto amountDto, HttpServletRequest request) {
        fridgeService.changeFridgeIngredientAmount(ingredientId, amountDto.getAmount(), getLoginFromToken(request));
        return ResponseEntity.status(200).build();
    }

    @PostMapping(value = "/scanFridgeReceipt", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<FridgeIngredientDto>> scanFridgeReceipt(@RequestPart("file") MultipartFile file) {
        List<FridgeIngredientDto> detectedItems = geminiService.extractFridgeIngredientsFromReceipt(file);
        return ResponseEntity.ok(detectedItems);
    }

}
