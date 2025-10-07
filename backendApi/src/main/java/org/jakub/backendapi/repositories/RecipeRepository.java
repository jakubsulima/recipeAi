package org.jakub.backendapi.repositories;

import org.jakub.backendapi.entities.Recipe;
import org.jakub.backendapi.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    Optional<Recipe> findByName(String name);

    Page<Recipe> findByUser(User user, Pageable pageable);

    Optional<Object> findByNameAndUser(String name, User user);

    @Query("""

                SELECT u FROM Recipe u WHERE 
            LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            """)
    Page<Recipe> search(@Param("searchTerm") String searchTerm, Pageable pageable);
}