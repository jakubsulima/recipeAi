package org.jakub.backendapi.controllers;

import jakarta.servlet.http.HttpServletRequest;
import org.jakub.backendapi.dto.ShoppingListItemDto;
import org.jakub.backendapi.services.ShoppingListService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.jakub.backendapi.config.JwtUtils.getLoginFromToken;

@RestController
public class ShoppingListController {

    private final ShoppingListService shoppingListService;

    public ShoppingListController(ShoppingListService shoppingListService) {
        this.shoppingListService = shoppingListService;
    }

    public record ReplaceShoppingListRequest(List<ShoppingListItemDto> items) {
    }

    @GetMapping("/shoppingList")
    public ResponseEntity<List<ShoppingListItemDto>> getShoppingList(HttpServletRequest request) {
        return ResponseEntity.ok(shoppingListService.getShoppingList(getLoginFromToken(request)));
    }

    @PutMapping("/shoppingList")
    public ResponseEntity<List<ShoppingListItemDto>> replaceShoppingList(
            @RequestBody(required = false) ReplaceShoppingListRequest payload,
            HttpServletRequest request
    ) {
        List<ShoppingListItemDto> items = payload != null && payload.items() != null ? payload.items() : List.of();
        return ResponseEntity.ok(shoppingListService.replaceShoppingList(getLoginFromToken(request), items));
    }
}
