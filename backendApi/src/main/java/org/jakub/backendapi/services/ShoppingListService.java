package org.jakub.backendapi.services;

import org.jakub.backendapi.dto.ShoppingListItemDto;
import org.jakub.backendapi.entities.ShoppingListItem;
import org.jakub.backendapi.entities.User;
import org.jakub.backendapi.exceptions.AppException;
import org.jakub.backendapi.repositories.ShoppingListItemRepository;
import org.jakub.backendapi.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ShoppingListService {

    private static final int MAX_SHOPPING_LIST_ITEMS = 500;

    private final ShoppingListItemRepository shoppingListItemRepository;
    private final UserRepository userRepository;

    public ShoppingListService(ShoppingListItemRepository shoppingListItemRepository, UserRepository userRepository) {
        this.shoppingListItemRepository = shoppingListItemRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ShoppingListItemDto> getShoppingList(String email) {
        User user = resolveUser(email);
        return shoppingListItemRepository.findByUserOrderByCreatedAtAsc(user)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<ShoppingListItemDto> replaceShoppingList(String email, List<ShoppingListItemDto> items) {
        User user = resolveUser(email);
        List<ShoppingListItemDto> safeItems = items == null ? List.of() : items;

        if (safeItems.size() > MAX_SHOPPING_LIST_ITEMS) {
            throw new AppException("Shopping list is too large. Maximum allowed items: " + MAX_SHOPPING_LIST_ITEMS, HttpStatus.BAD_REQUEST);
        }

        shoppingListItemRepository.deleteByUser(user);

        List<ShoppingListItem> entities = safeItems.stream()
                .map(item -> toEntity(item, user))
                .filter(item -> item != null)
                .collect(Collectors.toList());

        if (entities.isEmpty()) {
            return List.of();
        }

        return shoppingListItemRepository.saveAll(entities)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private User resolveUser(String email) {
        if (!StringUtils.hasText(email)) {
            throw new AppException("Unauthorized", HttpStatus.UNAUTHORIZED);
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
    }

    private ShoppingListItem toEntity(ShoppingListItemDto dto, User user) {
        if (dto == null || !StringUtils.hasText(dto.getName())) {
            return null;
        }

        ShoppingListItem item = new ShoppingListItem();
        item.setUser(user);
        item.setClientItemId(resolveClientItemId(dto.getId()));
        item.setName(dto.getName().trim());
        item.setAmount(dto.getAmount());
        item.setUnit(trimToNull(dto.getUnit()));
        item.setChecked(dto.isChecked());
        item.setCreatedAt(parseCreatedAt(dto.getCreatedAt()));
        return item;
    }

    private ShoppingListItemDto toDto(ShoppingListItem entity) {
        return new ShoppingListItemDto(
                entity.getClientItemId(),
                entity.getName(),
                entity.getAmount(),
                entity.getUnit(),
                entity.isChecked(),
                entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : Instant.now().toString()
        );
    }

    private String resolveClientItemId(String id) {
        return StringUtils.hasText(id) ? id.trim() : UUID.randomUUID().toString();
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private Instant parseCreatedAt(String value) {
        if (!StringUtils.hasText(value)) {
            return Instant.now();
        }

        try {
            return Instant.parse(value.trim());
        } catch (DateTimeParseException ignored) {
            return Instant.now();
        }
    }
}
