package org.jakub.backendapi.repositories;

import org.jakub.backendapi.entities.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
    Ingredient findByName(String name);

    Optional<Ingredient> findByNameIgnoreCase(String name);
}
