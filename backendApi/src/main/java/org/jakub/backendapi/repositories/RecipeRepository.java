package org.jakub.backendapi.repositories;

import org.jakub.backendapi.entities.Recipe;
import org.jakub.backendapi.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    Optional<Recipe> findByName(String name);

    Optional<Recipe> findByUser(User user);

    Optional<Object> findByNameAndUser(String name, User user);
}
