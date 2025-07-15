package org.jakub.backendapi.repositories;

import org.jakub.backendapi.entities.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
    Optional<Ingredient> findByName(String name);

    Optional<Ingredient> findByNameIgnoreCase(String name);
}

