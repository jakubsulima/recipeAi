package org.jakub.backendapi.controllers;

import org.jakub.backendapi.dto.UserDto;
import org.jakub.backendapi.entities.Enums.Role;
import org.jakub.backendapi.entities.Enums.SubscriptionPlan;
import org.jakub.backendapi.exceptions.AppException;
import org.jakub.backendapi.services.UserService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;

@RestController
@RequestMapping("/admin/users")
public class AdminUserController {

    public record UpdateUserPlanRequest(String plan) {
    }

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<Page<UserDto>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<UserDto> updateUserRole(@PathVariable Long id, @RequestBody Role role) {
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    @PutMapping("/{id}/plan")
    public ResponseEntity<UserDto> updateUserPlan(@PathVariable Long id, @RequestBody UpdateUserPlanRequest request) {
        if (request == null || !StringUtils.hasText(request.plan())) {
            throw new AppException("Plan is required. Use FREE or PAID.", HttpStatus.BAD_REQUEST);
        }

        SubscriptionPlan subscriptionPlan;
        try {
            subscriptionPlan = SubscriptionPlan.valueOf(request.plan().trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new AppException("Invalid plan value. Allowed values: FREE, PAID.", HttpStatus.BAD_REQUEST);
        }

        return ResponseEntity.ok(userService.updateUserPlan(id, subscriptionPlan));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
