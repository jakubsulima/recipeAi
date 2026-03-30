package org.jakub.backendapi.repositories;

import org.jakub.backendapi.entities.ShoppingListItem;
import org.jakub.backendapi.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShoppingListItemRepository extends JpaRepository<ShoppingListItem, Long> {
    List<ShoppingListItem> findByUserOrderByCreatedAtAsc(User user);

    void deleteByUser(User user);
}
